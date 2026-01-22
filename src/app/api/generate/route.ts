import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getLanguageName } from '@/lib/languages';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const { mode, content, targetLanguage, cardCount } = await request.json();

    if (!content || !targetLanguage) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const languageName = getLanguageName(targetLanguage);

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === 'topic') {
      systemPrompt = `You are a language learning flashcard generator. Generate vocabulary flashcards for learning ${languageName}.
Each card should have:
- front: The word/phrase in ${languageName}
- back: The English translation
- example: An example sentence in ${languageName} using the word
- exampleTranslation: The English translation of the example

Output each card as a JSON object on its own line. Do not include any other text.`;

      userPrompt = `Generate ${cardCount} flashcards about the topic: "${content}"`;
    } else {
      // wordlist mode
      const words = content
        .split('\n')
        .map((w: string) => w.trim())
        .filter(Boolean);

      systemPrompt = `You are a language learning flashcard generator. Create flashcards for learning ${languageName}.
Each card should have:
- front: The word/phrase in ${languageName}
- back: The English translation
- example: An example sentence in ${languageName} using the word
- exampleTranslation: The English translation of the example

Output each card as a JSON object on its own line. Do not include any other text.`;

      userPrompt = `Create flashcards for these ${languageName} words:\n${words.join('\n')}`;
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let buffer = '';

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            buffer += content;

            // Try to extract complete JSON objects from buffer
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              try {
                // Try to parse as JSON
                const card = JSON.parse(trimmed);
                if (card.front && card.back) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(card)}\n\n`)
                  );
                }
              } catch {
                // Not valid JSON yet, skip
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const card = JSON.parse(buffer.trim());
              if (card.front && card.back) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(card)}\n\n`)
                );
              }
            } catch {
              // Ignore invalid final buffer
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'Failed to generate cards' },
      { status: 500 }
    );
  }
}

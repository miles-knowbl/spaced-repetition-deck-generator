import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getLanguageName } from '@/lib/languages';

interface CardToProcess {
  id: string;
  front: string;
  back: string;
}

interface TranslateRequest {
  cards: CardToProcess[];
  targetLanguage: string;
}

interface ProcessedCard {
  id: string;
  front: string; // Translated to target language
  back: string; // English definition
  originalFront: string; // Original non-English word
  valid: boolean; // Whether card has English on one side
}

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
    const { cards, targetLanguage }: TranslateRequest = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return Response.json(
        { error: 'No cards to process' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return Response.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    const languageName = getLanguageName(targetLanguage);
    
    // Step 1: Detect which side is English and normalize cards
        const cardList = cards
      .map((c, i) => `${i + 1}. FRONT: "${c.front}" | BACK: "${c.back}"`)
      .join('\n');

    const detectResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You analyze flashcards to detect which side is English.

For each card, determine:
- "front_is_english": true if front is English, false otherwise
- "back_is_english": true if back is English, false otherwise
- "valid": true if EXACTLY ONE side is English (not both, not neither)

Output a JSON array with one object per card in order.
Example output:
[
  {"front_is_english": false, "back_is_english": true, "valid": true},
  {"front_is_english": true, "back_is_english": false, "valid": true},
  {"front_is_english": true, "back_is_english": true, "valid": false},
  {"front_is_english": false, "back_is_english": false, "valid": false}
]`,
        },
        {
          role: 'user',
          content: `Analyze these flashcards:\n${cardList}`,
        },
      ],
      temperature: 0.1,
    });

    const detectContent = detectResponse.choices[0]?.message?.content?.trim() || '[]';

    let detections: Array<{ front_is_english: boolean; back_is_english: boolean; valid: boolean }>;
    try {
      detections = JSON.parse(detectContent);
    } catch {
      const match = detectContent.match(/\[[\s\S]*\]/);
      if (match) {
        detections = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse detection response');
      }
    }

    
    // Step 2: Normalize cards (English always on back) and collect words to translate
    const normalizedCards: Array<{
      id: string;
      englishSide: string;
      foreignSide: string;
      valid: boolean;
    }> = [];

    cards.forEach((card, i) => {
      const detection = detections[i];
      if (!detection || !detection.valid) {
        normalizedCards.push({
          id: card.id,
          englishSide: '',
          foreignSide: '',
          valid: false,
        });
        return;
      }

      if (detection.front_is_english) {
        // English on front, foreign on back -> swap
        normalizedCards.push({
          id: card.id,
          englishSide: card.front,
          foreignSide: card.back,
          valid: true,
        });
      } else {
        // Foreign on front, English on back -> keep as is
        normalizedCards.push({
          id: card.id,
          englishSide: card.back,
          foreignSide: card.front,
          valid: true,
        });
      }
    });

    // Step 3: Translate foreign words to target language
    const validCards = normalizedCards.filter((c) => c.valid);
    
    if (validCards.length === 0) {
      return Response.json({
        cards: normalizedCards.map((c) => ({
          id: c.id,
          front: '',
          back: '',
          originalFront: '',
          valid: false,
        }))
      });
    }

    const wordsToTranslate = validCards
      .map((c, i) => `${i + 1}. ${c.foreignSide}`)
      .join('\n');

    const translateResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a translator. Translate each word/phrase to ${languageName}.
Output ONLY a JSON array with the translations in the same order.
Keep translations concise - just the word/phrase, no explanations.`,
        },
        {
          role: 'user',
          content: `Translate these to ${languageName}:\n${wordsToTranslate}`,
        },
      ],
      temperature: 0.3,
    });

    const translateContent = translateResponse.choices[0]?.message?.content?.trim() || '[]';

    let translations: string[];
    try {
      translations = JSON.parse(translateContent);
    } catch {
      const match = translateContent.match(/\[[\s\S]*\]/);
      if (match) {
        translations = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse translation response');
      }
    }

    
    // Step 4: Build final results
    let translationIndex = 0;
    const results: ProcessedCard[] = normalizedCards.map((card) => {
      if (!card.valid) {
        return {
          id: card.id,
          front: '',
          back: '',
          originalFront: '',
          valid: false,
        };
      }

      const translatedFront = translations[translationIndex] || card.foreignSide;
      translationIndex++;

      return {
        id: card.id,
        front: translatedFront,
        back: card.englishSide,
        originalFront: card.foreignSide,
        valid: true,
      };
    });

    return Response.json({ cards: results });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json(
      { error: 'Failed to process cards' },
      { status: 500 }
    );
  }
}

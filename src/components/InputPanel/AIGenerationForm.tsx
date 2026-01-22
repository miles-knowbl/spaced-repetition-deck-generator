'use client';

import { useState } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { getLanguageName } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';

export function AIGenerationForm() {
  const [mode, setMode] = useState<'topic' | 'wordlist'>('wordlist');
  const [content, setContent] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const { targetLanguage, isGenerating, setIsGenerating, addCard } =
    useDeckStore();

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter a topic or word list');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          content: content.trim(),
          targetLanguage,
          cardCount: parseInt(cardCount, 10),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const card = JSON.parse(data);
              addCard({
                front: card.front,
                back: card.back,
                example: card.example,
                exampleTranslation: card.exampleTranslation,
                tags: [],
                source: 'ai',
              });
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Mode</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="topic"
              checked={mode === 'topic'}
              onChange={() => setMode('topic')}
              className="w-4 h-4"
            />
            <span className="text-sm">Topic</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="wordlist"
              checked={mode === 'wordlist'}
              onChange={() => setMode('wordlist')}
              className="w-4 h-4"
            />
            <span className="text-sm">Word List</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">
          {mode === 'topic'
            ? 'Enter a topic (e.g., "food and cooking")'
            : 'Enter words, one per line'}
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            mode === 'topic'
              ? 'Enter a topic like "travel vocabulary", "business terms", etc.'
              : 'hola\ngracias\npor favor\nadios'
          }
          className="min-h-[150px]"
          disabled={isGenerating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardCount">Cards to generate</Label>
        <Select
          value={cardCount}
          onValueChange={setCardCount}
          disabled={isGenerating}
        >
          <SelectTrigger id="cardCount" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 25, 30, 40, 50].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} cards
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !content.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating for {getLanguageName(targetLanguage)}...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Cards
          </>
        )}
      </Button>
    </div>
  );
}

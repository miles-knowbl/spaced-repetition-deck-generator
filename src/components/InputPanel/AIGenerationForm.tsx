'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
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
  const t = useTranslations('aiForm');
  const tLang = useTranslations('languages');
  const tPlaceholders = useTranslations('placeholders');
  const [mode, setMode] = useState<'topic' | 'wordlist'>('topic');
  const [content, setContent] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const { targetLanguage, isGenerating, setIsGenerating, addCard } =
    useDeckStore();

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError(t('error'));
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
    <div className="space-y-5 pt-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('mode')}</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="mode"
              value="topic"
              checked={mode === 'topic'}
              onChange={() => setMode('topic')}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm group-hover:text-foreground transition-colors">
              {t('topic')}
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="mode"
              value="wordlist"
              checked={mode === 'wordlist'}
              onChange={() => setMode('wordlist')}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm group-hover:text-foreground transition-colors">
              {t('wordList')}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium">
          {mode === 'topic' ? t('topicLabel') : t('wordListLabel')}
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={mode === 'topic' ? t('topicPlaceholder') : tPlaceholders(`${targetLanguage}.wordList`)}
          className="min-h-[140px]"
          disabled={isGenerating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardCount" className="text-sm font-medium">
          {t('cardCount')}
        </Label>
        <Select
          value={cardCount}
          onValueChange={setCardCount}
          disabled={isGenerating}
        >
          <SelectTrigger id="cardCount" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 25, 30, 40, 50].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} {t('cards')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !content.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('generating', { language: tLang(targetLanguage) })}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {t('generate')}
          </>
        )}
      </Button>
    </div>
  );
}

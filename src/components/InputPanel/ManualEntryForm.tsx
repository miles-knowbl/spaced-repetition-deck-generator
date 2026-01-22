'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function ManualEntryForm() {
  const t = useTranslations('manualForm');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { addCard } = useDeckStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!front.trim()) {
      setError(t('termError'));
      return;
    }

    if (!back.trim()) {
      setError(t('translationError'));
      return;
    }

    addCard({
      front: front.trim(),
      back: back.trim(),
      example: example.trim() || undefined,
      exampleTranslation: exampleTranslation.trim() || undefined,
      tags: [],
      source: 'manual',
    });

    setFront('');
    setBack('');
    setExample('');
    setExampleTranslation('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="front" className="text-sm font-medium">
          {t('termLabel')} <span className="text-destructive">{t('required')}</span>
        </Label>
        <Input
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder={t('termPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="back" className="text-sm font-medium">
          {t('translationLabel')} <span className="text-destructive">{t('required')}</span>
        </Label>
        <Input
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder={t('translationPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="example" className="text-sm font-medium text-muted-foreground">
          {t('exampleLabel')}
        </Label>
        <Textarea
          id="example"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder={t('examplePlaceholder')}
          className="min-h-[70px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exampleTranslation" className="text-sm font-medium text-muted-foreground">
          {t('exampleTranslationLabel')}
        </Label>
        <Textarea
          id="exampleTranslation"
          value={exampleTranslation}
          onChange={(e) => setExampleTranslation(e.target.value)}
          placeholder={t('exampleTranslationPlaceholder')}
          className="min-h-[70px]"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        {t('addCard')}
      </Button>
    </form>
  );
}

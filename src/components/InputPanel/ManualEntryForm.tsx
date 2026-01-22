'use client';

import { useState } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function ManualEntryForm() {
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
      setError('Please enter the term');
      return;
    }

    if (!back.trim()) {
      setError('Please enter the translation');
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

    // Clear form
    setFront('');
    setBack('');
    setExample('');
    setExampleTranslation('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="front">Term (in target language) *</Label>
        <Input
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="e.g., hola"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="back">Translation (English) *</Label>
        <Input
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="e.g., hello"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="example">Example sentence (optional)</Label>
        <Textarea
          id="example"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="e.g., ¡Hola! ¿Cómo estás?"
          className="min-h-[60px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exampleTranslation">
          Example translation (optional)
        </Label>
        <Textarea
          id="exampleTranslation"
          value={exampleTranslation}
          onChange={(e) => setExampleTranslation(e.target.value)}
          placeholder="e.g., Hello! How are you?"
          className="min-h-[60px]"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Card
      </Button>
    </form>
  );
}

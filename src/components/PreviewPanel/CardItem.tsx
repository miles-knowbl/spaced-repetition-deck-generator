'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import type { Card } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Check, X, ArrowRight } from 'lucide-react';

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const t = useTranslations('cardItem');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState(card);

  const { updateCard, removeCard } = useDeckStore();

  const handleSave = () => {
    if (!editedCard.front.trim() || !editedCard.back.trim()) return;

    updateCard(card.id, {
      front: editedCard.front.trim(),
      back: editedCard.back.trim(),
      example: editedCard.example?.trim() || undefined,
      exampleTranslation: editedCard.exampleTranslation?.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCard(card);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-accent/30 animate-fade-in">
        <Input
          value={editedCard.front}
          onChange={(e) =>
            setEditedCard({ ...editedCard, front: e.target.value })
          }
          placeholder={t('frontPlaceholder')}
          className="text-sm"
        />
        <Input
          value={editedCard.back}
          onChange={(e) =>
            setEditedCard({ ...editedCard, back: e.target.value })
          }
          placeholder={t('backPlaceholder')}
          className="text-sm"
        />
        <Textarea
          value={editedCard.example || ''}
          onChange={(e) =>
            setEditedCard({ ...editedCard, example: e.target.value })
          }
          placeholder={t('examplePlaceholder')}
          className="text-sm min-h-[60px]"
        />
        <Textarea
          value={editedCard.exampleTranslation || ''}
          onChange={(e) =>
            setEditedCard({ ...editedCard, exampleTranslation: e.target.value })
          }
          placeholder={t('exampleTranslationPlaceholder')}
          className="text-sm min-h-[60px]"
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            {t('cancel')}
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            {t('save')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-lg p-3.5 group hover:bg-accent/30 hover:border-border transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{card.front}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{card.back}</span>
          </div>
          {card.example && (
            <p className="text-sm text-muted-foreground mt-1.5 truncate italic">
              {card.example}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeCard(card.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

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
      <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-accent/20 animate-fade-in">
        <Input
          value={editedCard.front}
          onChange={(e) =>
            setEditedCard({ ...editedCard, front: e.target.value })
          }
          placeholder={t('frontPlaceholder')}
          className="text-sm font-mono"
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
          className="text-sm min-h-[56px]"
        />
        <Textarea
          value={editedCard.exampleTranslation || ''}
          onChange={(e) =>
            setEditedCard({ ...editedCard, exampleTranslation: e.target.value })
          }
          placeholder={t('exampleTranslationPlaceholder')}
          className="text-sm min-h-[56px]"
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button size="sm" variant="ghost" onClick={handleCancel} className="text-xs">
            <X className="h-3.5 w-3.5 mr-1" />
            {t('cancel')}
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs">
            <Check className="h-3.5 w-3.5 mr-1" />
            {t('save')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/40 rounded-lg p-3 group hover:bg-accent/30 hover:border-border/60 transition-all duration-150">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-sm truncate">{card.front}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-muted-foreground text-sm truncate">{card.back}</span>
          </div>
          {card.example && (
            <p className="text-xs text-muted-foreground/70 mt-1.5 truncate">
              {card.example}
            </p>
          )}
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeCard(card.id)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

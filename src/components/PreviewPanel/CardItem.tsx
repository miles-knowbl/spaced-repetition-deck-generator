'use client';

import { useState } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import type { Card } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
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
      <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
        <Input
          value={editedCard.front}
          onChange={(e) =>
            setEditedCard({ ...editedCard, front: e.target.value })
          }
          placeholder="Front (term)"
          className="text-sm"
        />
        <Input
          value={editedCard.back}
          onChange={(e) =>
            setEditedCard({ ...editedCard, back: e.target.value })
          }
          placeholder="Back (translation)"
          className="text-sm"
        />
        <Textarea
          value={editedCard.example || ''}
          onChange={(e) =>
            setEditedCard({ ...editedCard, example: e.target.value })
          }
          placeholder="Example sentence (optional)"
          className="text-sm min-h-[60px]"
        />
        <Textarea
          value={editedCard.exampleTranslation || ''}
          onChange={(e) =>
            setEditedCard({ ...editedCard, exampleTranslation: e.target.value })
          }
          placeholder="Example translation (optional)"
          className="text-sm min-h-[60px]"
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 group hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium truncate">{card.front}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground truncate">{card.back}</span>
          </div>
          {card.example && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
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
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeCard(card.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

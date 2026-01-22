'use client';

import { useDeckStore } from '@/stores/deckStore';
import { CardItem } from './CardItem';

export function CardList() {
  const { cards } = useDeckStore();

  if (cards.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
        <p>No cards yet</p>
        <p className="text-sm mt-1">
          Add cards using AI generation, manual entry, or file import
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}

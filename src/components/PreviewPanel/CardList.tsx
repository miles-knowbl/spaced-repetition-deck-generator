'use client';

import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { CardItem } from './CardItem';
import { Inbox } from 'lucide-react';

export function CardList() {
  const t = useTranslations('preview');
  const { cards } = useDeckStore();

  if (cards.length === 0) {
    return (
      <div className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-muted/50">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium">{t('noCards')}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {t('noCardsHint')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}

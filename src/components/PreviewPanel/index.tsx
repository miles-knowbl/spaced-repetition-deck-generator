'use client';

import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardList } from './CardList';
import { ExportSection } from './ExportSection';
import { Trash2, Layers } from 'lucide-react';

export function PreviewPanel() {
  const t = useTranslations('preview');
  const { cards, deckName, setDeckName, clearDeck } = useDeckStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{t('title')}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            {cards.length === 1 ? t('cardCount', { count: 1 }) : t('cardCountPlural', { count: cards.length })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="deckName" className="text-sm font-medium">
            {t('deckName')}
          </Label>
          <Input
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder={t('deckNamePlaceholder')}
          />
        </div>

        <CardList />

        <div className="flex gap-3">
          <ExportSection />
          {cards.length > 0 && (
            <Button
              variant="outline"
              onClick={clearDeck}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('clearAll')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

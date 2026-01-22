'use client';

import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardList } from './CardList';
import { ExportSection } from './ExportSection';
import { Trash2 } from 'lucide-react';

export function PreviewPanel() {
  const t = useTranslations('preview');
  const { cards, deckName, setDeckName, clearDeck } = useDeckStore();

  return (
    <Card className="shadow-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wide">
            {t('title')}
          </CardTitle>
          <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded">
            {cards.length === 1 ? t('cardCount', { count: 1 }) : t('cardCountPlural', { count: cards.length })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="deckName" className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('deckName')}
          </Label>
          <Input
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder={t('deckNamePlaceholder')}
            className="font-medium"
          />
        </div>

        <div className="divider" />

        <CardList />

        <div className="flex gap-3 pt-2">
          <ExportSection />
          {cards.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDeck}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              {t('clearAll')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

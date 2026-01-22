'use client';

import { useDeckStore } from '@/stores/deckStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardList } from './CardList';
import { ExportSection } from './ExportSection';
import { Trash2 } from 'lucide-react';

export function PreviewPanel() {
  const { cards, deckName, setDeckName, clearDeck } = useDeckStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Preview</CardTitle>
          <span className="text-sm text-muted-foreground">
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deckName">Deck Name</Label>
          <Input
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="My Language Deck"
          />
        </div>

        <CardList />

        <div className="flex gap-2">
          <ExportSection />
          {cards.length > 0 && (
            <Button
              variant="outline"
              onClick={clearDeck}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

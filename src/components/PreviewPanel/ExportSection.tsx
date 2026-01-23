'use client';

import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { createApkgBlob } from '@/lib/ankiExport';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export function ExportSection() {
  const t = useTranslations('export');
  const { cards, deckName, description, isExporting, setIsExporting } =
    useDeckStore();

  const handleExport = async () => {
    if (cards.length === 0) return;

    // Filter to valid cards only
    const validCards = cards.filter(
      (card) =>
        card.front && typeof card.front === 'string' &&
        card.back && typeof card.back === 'string'
    );

    if (validCards.length === 0) {
      alert('No valid cards to export');
      return;
    }

    setIsExporting(true);

    try {
      // Create .apkg file client-side (avoids serverless WASM issues)
      const blob = await createApkgBlob(
        deckName || 'My Deck',
        description,
        validCards
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckName || 'deck'}.apkg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={cards.length === 0 || isExporting}
      className="flex-1"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('exporting')}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {t('button')}
        </>
      )}
    </Button>
  );
}

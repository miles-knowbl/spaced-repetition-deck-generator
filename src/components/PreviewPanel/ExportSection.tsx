'use client';

import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export function ExportSection() {
  const t = useTranslations('export');
  const { cards, deckName, description, isExporting, setIsExporting } =
    useDeckStore();

  const handleExport = async () => {
    if (cards.length === 0) return;

    setIsExporting(true);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckName: deckName || 'My Deck',
          description,
          cards,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Export failed');
      }

      const blob = await response.blob();
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

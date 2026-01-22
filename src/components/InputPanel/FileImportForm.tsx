'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { parseFile } from '@/lib/fileParser';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

export function FileImportForm() {
  const t = useTranslations('importForm');
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addCards } = useDeckStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError(t('fileSizeError'));
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt'].includes(extension || '')) {
      setError(t('fileTypeError'));
      return;
    }

    setFileName(file.name);
    setError(null);
    setResult(null);

    try {
      const content = await file.text();
      const parseResult = parseFile(content, file.name, hasHeader);

      if (parseResult.cards.length === 0) {
        setError(t('noCardsError'));
        return;
      }

      addCards(parseResult.cards);
      setResult({
        imported: parseResult.cards.length,
        skipped: parseResult.skipped,
        errors: parseResult.errors.slice(0, 5),
      });
    } catch {
      setError(t('parseError'));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5 pt-4">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <span className="text-sm font-medium">
            {t('uploadTitle')}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('uploadHint')}
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="hasHeader"
          checked={hasHeader}
          onChange={(e) => setHasHeader(e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        <Label htmlFor="hasHeader" className="text-sm cursor-pointer">
          {t('hasHeader')}
        </Label>
      </div>

      {fileName && !error && !result && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <FileText className="h-4 w-4" />
          {fileName}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-2 bg-success/10 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {t('imported', { count: result.imported })}
              {result.skipped > 0 && (
                <span className="text-muted-foreground ml-1">
                  {t('skipped', { count: result.skipped })}
                </span>
              )}
            </span>
          </div>
          {result.errors.length > 0 && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground transition-colors">
                {t('showWarnings', { count: result.errors.length })}
              </summary>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1.5 bg-muted/30 px-4 py-3 rounded-lg">
        <p className="font-medium text-foreground/80">{t('formatTitle')}</p>
        <p>{t('csvFormat')}</p>
        <p>{t('txtFormat')}</p>
      </div>
    </div>
  );
}

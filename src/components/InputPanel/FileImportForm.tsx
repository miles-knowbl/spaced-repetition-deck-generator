'use client';

import { useState, useRef } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { parseFile } from '@/lib/fileParser';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';

export function FileImportForm() {
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

    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      setError('File must be under 1MB');
      return;
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt'].includes(extension || '')) {
      setError('File must be CSV or TXT');
      return;
    }

    setFileName(file.name);
    setError(null);
    setResult(null);

    try {
      const content = await file.text();
      const parseResult = parseFile(content, file.name, hasHeader);

      if (parseResult.cards.length === 0) {
        setError('No valid flashcards found in file');
        return;
      }

      addCards(parseResult.cards);
      setResult({
        imported: parseResult.cards.length,
        skipped: parseResult.skipped,
        errors: parseResult.errors.slice(0, 5), // Show first 5 errors
      });
    } catch (err) {
      setError('Could not parse file. Check format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
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
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">
            Click to upload CSV or TXT file
          </span>
          <span className="text-xs text-muted-foreground">
            Max 1MB. Format: front, back, example (optional)
          </span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasHeader"
          checked={hasHeader}
          onChange={(e) => setHasHeader(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="hasHeader" className="text-sm cursor-pointer">
          File has header row (skip first row)
        </Label>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {fileName}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="text-sm space-y-1">
          <p className="text-green-600">
            Imported {result.imported} cards
            {result.skipped > 0 && ` (${result.skipped} skipped)`}
          </p>
          {result.errors.length > 0 && (
            <details className="text-muted-foreground">
              <summary className="cursor-pointer">
                Show {result.errors.length} warning(s)
              </summary>
              <ul className="list-disc pl-4 mt-1">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Expected format:</p>
        <p>CSV: front,back,example,exampleTranslation</p>
        <p>TXT: front;back;example (tab, semicolon, or comma separated)</p>
      </div>
    </div>
  );
}

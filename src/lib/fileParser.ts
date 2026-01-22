import Papa from 'papaparse';
import type { Card } from '@/types';

export interface ParseResult {
  cards: Omit<Card, 'id' | 'createdAt'>[];
  skipped: number;
  errors: string[];
}

export function parseCSV(
  content: string,
  hasHeader: boolean = true
): ParseResult {
  const result = Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data as string[][];
  const cards: Omit<Card, 'id' | 'createdAt'>[] = [];
  let skipped = 0;
  const errors: string[] = [];

  // Skip header row if specified
  const dataRows = hasHeader ? rows.slice(1) : rows;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = hasHeader ? i + 2 : i + 1;

    // Need at least 2 columns: front, back
    if (row.length < 2) {
      skipped++;
      errors.push(`Row ${rowNum}: Not enough columns (need at least 2)`);
      continue;
    }

    const front = row[0]?.trim();
    const back = row[1]?.trim();

    if (!front || !back) {
      skipped++;
      errors.push(`Row ${rowNum}: Empty front or back`);
      continue;
    }

    cards.push({
      front,
      back,
      example: row[2]?.trim() || undefined,
      exampleTranslation: row[3]?.trim() || undefined,
      notes: row[4]?.trim() || undefined,
      tags: [],
      source: 'import',
    });
  }

  return { cards, skipped, errors };
}

export function parseTXT(content: string): ParseResult {
  const lines = content.split('\n').filter((line) => line.trim());
  const cards: Omit<Card, 'id' | 'createdAt'>[] = [];
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const rowNum = i + 1;

    // Try tab-separated first, then semicolon, then comma
    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes(';')) {
      parts = line.split(';');
    } else if (line.includes(',')) {
      parts = line.split(',');
    } else {
      // Single word - can't create card without translation
      skipped++;
      errors.push(`Row ${rowNum}: No separator found (use tab, semicolon, or comma)`);
      continue;
    }

    const front = parts[0]?.trim();
    const back = parts[1]?.trim();

    if (!front || !back) {
      skipped++;
      errors.push(`Row ${rowNum}: Empty front or back`);
      continue;
    }

    cards.push({
      front,
      back,
      example: parts[2]?.trim() || undefined,
      exampleTranslation: parts[3]?.trim() || undefined,
      notes: parts[4]?.trim() || undefined,
      tags: [],
      source: 'import',
    });
  }

  return { cards, skipped, errors };
}

export function parseFile(
  content: string,
  filename: string,
  hasHeader: boolean = true
): ParseResult {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(content, hasHeader);
  } else if (extension === 'txt') {
    return parseTXT(content);
  } else {
    // Try to auto-detect
    if (content.includes(',') && content.includes('\n')) {
      return parseCSV(content, hasHeader);
    }
    return parseTXT(content);
  }
}

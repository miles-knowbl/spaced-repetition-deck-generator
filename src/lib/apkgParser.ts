import initSqlJs from 'sql.js';
import JSZip from 'jszip';

export interface ImportedCard {
  front: string;
  back: string;
  tags: string[];
  source: 'import';
}

export interface ApkgParseResult {
  deckName: string;
  cards: ImportedCard[];
}

function stripHtml(html: string): string {
  // Replace <br> tags with newlines
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  // Remove all other HTML tags
  text = text.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Normalize whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

export async function parseApkgFile(file: File): Promise<ApkgParseResult> {
  // Extract the database from the .apkg (which is a zip file)
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const dbFile = zip.file('collection.anki2') || zip.file('collection.anki21');
  if (!dbFile) {
    throw new Error('Invalid .apkg file: no collection database found');
  }

  const dbBuffer = await dbFile.async('uint8array');

  // Initialize SQL.js with WASM from CDN (works in browser)
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database(dbBuffer);

  // Get deck name - try different schema versions
  let deckName = 'Imported Deck';
  try {
    // Try newer schema first (decks table)
    const decksTable = db.exec('SELECT name FROM decks LIMIT 1');
    if (decksTable.length > 0 && decksTable[0].values.length > 0) {
      const name = decksTable[0].values[0][0] as string;
      if (name && name !== 'Default') {
        deckName = name;
      }
    }
  } catch {
    // Fall back to older schema (col table with JSON)
    try {
      const colResult = db.exec('SELECT decks FROM col LIMIT 1');
      if (colResult.length > 0 && colResult[0].values.length > 0) {
        const decksJson = JSON.parse(colResult[0].values[0][0] as string);
        const deckIds = Object.keys(decksJson);
        for (const id of deckIds) {
          if (id !== '1' && decksJson[id].name) {
            deckName = decksJson[id].name;
            break;
          }
        }
      }
    } catch {
      // Ignore errors getting deck name, use default
    }
  }

  // Extract notes - the flds column contains fields separated by \x1f
  const cards: ImportedCard[] = [];
  try {
    const notesResult = db.exec('SELECT flds FROM notes');

    if (notesResult.length > 0 && notesResult[0].values.length > 0) {
      for (const row of notesResult[0].values) {
        const rawFields = row[0] as string;
        if (!rawFields) continue;

        const fields = rawFields.split('\x1f');

        if (fields.length >= 2) {
          const front = stripHtml(fields[0]);
          const back = stripHtml(fields[1]);

          if (front.trim() && back.trim()) {
            cards.push({
              front: front.trim(),
              back: back.trim(),
              tags: [],
              source: 'import',
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading notes:', error);
    db.close();
    throw new Error('Failed to read cards from .apkg file');
  }

  db.close();

  if (cards.length === 0) {
    throw new Error('No cards found in .apkg file');
  }

  return { deckName, cards };
}

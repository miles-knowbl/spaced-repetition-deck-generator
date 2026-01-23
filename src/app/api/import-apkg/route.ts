import { NextRequest } from 'next/server';
import initSqlJs from 'sql.js';
import JSZip from 'jszip';

// Vercel Pro: increase max duration for processing large files
export const maxDuration = 60;

interface ImportedCard {
  front: string;
  back: string;
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Support both: pre-extracted database OR full .apkg file
    const database = formData.get('database') as File | null;
    const file = formData.get('file') as File | null;

    let dbBuffer: Uint8Array;

    if (database) {
      // Client already extracted the database (handles large files)
      dbBuffer = new Uint8Array(await database.arrayBuffer());
    } else if (file) {
      // Full .apkg file uploaded (legacy/small files)
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const dbFile = zip.file('collection.anki2') || zip.file('collection.anki21');
      if (!dbFile) {
        return Response.json(
          { error: 'Invalid .apkg file: no collection database found' },
          { status: 400 }
        );
      }

      dbBuffer = await dbFile.async('uint8array');
    } else {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Initialize SQL.js with WASM from CDN
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    const db = new SQL.Database(dbBuffer);

    // Get deck name from decks JSON in col table
    let deckName = 'Imported Deck';
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
        if (deckName === 'Imported Deck' && deckIds.length > 0) {
          const firstDeck = decksJson[deckIds[0]];
          if (firstDeck.name && firstDeck.name !== 'Default') {
            deckName = firstDeck.name;
          }
        }
      }
    } catch {
      // Ignore errors getting deck name, use default
    }

    // Extract notes - the flds column contains fields separated by \x1f
    const cards: ImportedCard[] = [];
    try {
      const notesResult = db.exec('SELECT flds FROM notes');
      if (notesResult.length > 0) {
        for (const row of notesResult[0].values) {
          const fields = (row[0] as string).split('\x1f');
          if (fields.length >= 2) {
            const front = stripHtml(fields[0]);
            const back = stripHtml(fields[1]);

            if (front.trim() || back.trim()) {
              cards.push({
                front: front.trim(),
                back: back.trim(),
              });
            }
          }
        }
      }
    } catch {
      db.close();
      return Response.json(
        { error: 'Failed to read cards from .apkg file' },
        { status: 500 }
      );
    }

    db.close();

    if (cards.length === 0) {
      return Response.json(
        { error: 'No cards found in .apkg file' },
        { status: 400 }
      );
    }

    return Response.json({ deckName, cards });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json(
      { error: 'Failed to import .apkg file' },
      { status: 500 }
    );
  }
}

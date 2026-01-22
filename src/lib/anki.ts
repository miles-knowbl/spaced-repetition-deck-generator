import Database from 'better-sqlite3';
import JSZip from 'jszip';
import type { Card } from '@/types';

// Anki uses specific epoch for timestamps
const ANKI_EPOCH = 1577836800000; // 2020-01-01

function generateId(): number {
  return Date.now();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function formatCardContent(card: Card): { front: string; back: string } {
  const front = escapeHtml(card.front);

  let back = escapeHtml(card.back);
  if (card.example) {
    back += `<br><br><i>${escapeHtml(card.example)}</i>`;
    if (card.exampleTranslation) {
      back += `<br><small>${escapeHtml(card.exampleTranslation)}</small>`;
    }
  }

  return { front, back };
}

export async function createApkgFile(
  deckName: string,
  description: string,
  cards: Card[]
): Promise<Buffer> {
  const deckId = generateId();
  const modelId = generateId() + 1;
  const now = Date.now();

  // Create in-memory SQLite database
  const db = new Database(':memory:');

  // Create Anki schema
  db.exec(`
    CREATE TABLE col (
      id integer primary key,
      crt integer not null,
      mod integer not null,
      scm integer not null,
      ver integer not null,
      dty integer not null,
      usn integer not null,
      ls integer not null,
      conf text not null,
      models text not null,
      decks text not null,
      dconf text not null,
      tags text not null
    );

    CREATE TABLE notes (
      id integer primary key,
      guid text not null,
      mid integer not null,
      mod integer not null,
      usn integer not null,
      tags text not null,
      flds text not null,
      sfld text not null,
      csum integer not null,
      flags integer not null,
      data text not null
    );

    CREATE TABLE cards (
      id integer primary key,
      nid integer not null,
      did integer not null,
      ord integer not null,
      mod integer not null,
      usn integer not null,
      type integer not null,
      queue integer not null,
      due integer not null,
      ivl integer not null,
      factor integer not null,
      reps integer not null,
      lapses integer not null,
      left integer not null,
      odue integer not null,
      odid integer not null,
      flags integer not null,
      data text not null
    );

    CREATE TABLE revlog (
      id integer primary key,
      cid integer not null,
      usn integer not null,
      ease integer not null,
      ivl integer not null,
      lastIvl integer not null,
      factor integer not null,
      time integer not null,
      type integer not null
    );

    CREATE TABLE graves (
      usn integer not null,
      oid integer not null,
      type integer not null
    );
  `);

  // Basic model (note type)
  const model = {
    [modelId]: {
      id: modelId,
      name: 'Basic',
      type: 0,
      mod: Math.floor(now / 1000),
      usn: -1,
      sortf: 0,
      did: deckId,
      tmpls: [
        {
          name: 'Card 1',
          ord: 0,
          qfmt: '{{Front}}',
          afmt: '{{FrontSide}}<hr id="answer">{{Back}}',
          bqfmt: '',
          bafmt: '',
          did: null,
          bfont: '',
          bsize: 0,
        },
      ],
      flds: [
        {
          name: 'Front',
          ord: 0,
          sticky: false,
          rtl: false,
          font: 'Arial',
          size: 20,
          description: '',
        },
        {
          name: 'Back',
          ord: 1,
          sticky: false,
          rtl: false,
          font: 'Arial',
          size: 20,
          description: '',
        },
      ],
      css: `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}`,
      latexPre:
        '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      latexPost: '\\end{document}',
      latexsvg: false,
      req: [[0, 'any', [0]]],
      vers: [],
      tags: [],
    },
  };

  // Deck configuration
  const deck = {
    [deckId]: {
      id: deckId,
      name: deckName,
      mod: Math.floor(now / 1000),
      usn: -1,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: false,
      browserCollapsed: false,
      desc: description || '',
      dyn: 0,
      conf: 1,
      extendNew: 0,
      extendRev: 0,
    },
  };

  // Default deck config
  const dconf = {
    1: {
      id: 1,
      name: 'Default',
      new: {
        delays: [1, 10],
        ints: [1, 4, 0],
        initialFactor: 2500,
        separate: true,
        order: 1,
        perDay: 20,
        bury: false,
      },
      lapse: {
        delays: [10],
        mult: 0,
        minInt: 1,
        leechFails: 8,
        leechAction: 0,
      },
      rev: {
        perDay: 200,
        ease4: 1.3,
        fuzz: 0.05,
        minSpace: 1,
        ivlFct: 1,
        maxIvl: 36500,
        bury: false,
        hardFactor: 1.2,
      },
      maxTaken: 60,
      timer: 0,
      autoplay: true,
      replayq: true,
      mod: 0,
      usn: -1,
    },
  };

  const conf = {
    nextPos: 1,
    estTimes: true,
    activeDecks: [1],
    sortType: 'noteFld',
    timeLim: 0,
    sortBackwards: false,
    addToCur: true,
    curDeck: deckId,
    newSpread: 0,
    dueCounts: true,
    curModel: modelId,
    collapseTime: 1200,
  };

  // Insert collection data
  const colInsert = db.prepare(`
    INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  colInsert.run(
    1,
    Math.floor(now / 1000),
    Math.floor(now / 1000),
    Math.floor(now / 1000),
    11,
    0,
    0,
    0,
    JSON.stringify(conf),
    JSON.stringify(model),
    JSON.stringify(deck),
    JSON.stringify(dconf),
    '{}'
  );

  // Insert notes and cards
  const noteInsert = db.prepare(`
    INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cardInsert = db.prepare(`
    INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  cards.forEach((card, index) => {
    const noteId = now + index;
    const cardId = now + index + cards.length;
    const { front, back } = formatCardContent(card);
    const guid = `card_${noteId}`;

    // Calculate checksum (first 8 chars of sha1 as int, simplified)
    const csum = Math.abs(hashCode(front)) % 2147483647;

    noteInsert.run(
      noteId,
      guid,
      modelId,
      Math.floor(now / 1000),
      -1,
      '',
      `${front}\x1f${back}`,
      front,
      csum,
      0,
      ''
    );

    cardInsert.run(
      cardId,
      noteId,
      deckId,
      0,
      Math.floor(now / 1000),
      -1,
      0,
      0,
      index + 1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      ''
    );
  });

  // Export database to buffer
  const dbBuffer = db.serialize();
  db.close();

  // Create APKG (zip) file
  const zip = new JSZip();
  zip.file('collection.anki2', dbBuffer);
  zip.file('media', '{}');

  const apkgBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return apkgBuffer;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

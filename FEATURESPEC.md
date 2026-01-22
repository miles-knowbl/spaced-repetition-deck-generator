# Spaced Repetition Deck Generator FeatureSpec v1.0

| Property | Value |
|----------|-------|
| **Spec ID** | SPEC-001 |
| **Version** | 1.0 (Initial) |
| **Status** | Ready for Review |
| **Target Project** | spaced-repetition-deck-generator |
| **Dependencies** | None |
| **Compilation Date** | 2026-01-21 |

---

## 1. Feature Overview

**What this feature does:** A web application that generates Anki-compatible flashcard decks for language learners. Users input vocabulary through AI generation, manual entry, or file import, then download ready-to-use .apkg files.

**Core value proposition:** Eliminates the tedious manual work of creating language learning flashcards by providing AI-powered generation with translations and example sentences, while outputting in the universally-compatible Anki format.

**Key user stories:**
1. As a language learner, I can enter a topic and get AI-generated flashcards so that I don't have to manually create each card
2. As a language learner, I can manually add individual cards so that I can include specific vocabulary I've encountered
3. As a language learner, I can import a word list from a file so that I can convert existing study materials
4. As a language learner, I can preview all cards before export so that I can verify quality
5. As a language learner, I can edit or delete cards so that I can customize my deck
6. As a language learner, I can download my deck as .apkg so that I can import it directly into Anki
7. As the system, I generate translations and example sentences automatically so that cards are immediately useful

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              SPACED REPETITION DECK GENERATOR ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  UI LAYER (React + TypeScript)                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ InputPanel  │  │ CardPreview │  │  CardEditor │  │ExportPanel  │       │
│  │             │  │             │  │             │  │             │       │
│  │ - AI Gen    │  │ - Card List │  │ - Edit Card │  │ - Deck Name │       │
│  │ - Manual    │  │ - Flip View │  │ - Delete    │  │ - Download  │       │
│  │ - Import    │  │ - Preview   │  │ - Reorder   │  │ - .apkg     │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │               │
│         └────────────────┴────────────────┴────────────────┘               │
│                                    │                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  SERVICE LAYER                     │                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DeckStore (Zustand)                          │   │
│  │   cards: Card[], deckName: string, targetLanguage: string            │   │
│  │   addCards(), removeCard(), updateCard(), clearDeck()                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                │                │                                 │
│         ▼                ▼                ▼                                 │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐                          │
│  │ AIService │    │FileParser │    │AnkiExport │                          │
│  │           │    │           │    │           │                          │
│  │ OpenAI    │    │ CSV       │    │ .apkg     │                          │
│  │ Generate  │    │ TXT       │    │ SQLite    │                          │
│  └───────────┘    └───────────┘    └───────────┘                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  API LAYER (Next.js API Routes)                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  POST /api/generate    - AI card generation                          │   │
│  │  POST /api/export      - Generate .apkg file                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Feedback Timing Requirements

### Timing Bands

| Band | Target | Use For |
|------|--------|---------|
| 0ms | At input | Button press states |
| <50ms | Instant | Card flip animation start |
| <150ms | Animated | Card add/remove transitions |
| <300ms | Spring | Modal open/close |
| <3s | Loading | AI generation feedback |
| Background | Progress | Export generation |

### Interaction Patterns

| Action | 0ms | <50ms | <150ms | Background |
|--------|-----|-------|--------|------------|
| Add card manually | Button highlight | Card appears in list | Scroll to new card | — |
| Generate with AI | Button spinner | — | — | Progress indicator, cards stream in |
| Delete card | Strikethrough | Fade out | Remove from list | — |
| Export deck | Button spinner | — | — | Progress bar, then download |
| Flip card preview | — | Flip animation starts | — | — |

---

## 4. Entities

### Card Entity

```yaml
entity: Card
description: A single flashcard with front (term) and back (definition/translation)

attributes:
  - id: string (UUID)
  - front: string (the term/word in target language)
  - back: string (translation in English)
  - example: string? (example sentence using the term)
  - exampleTranslation: string? (translation of example)
  - notes: string? (additional notes/grammar)
  - tags: string[] (categorization)
  - createdAt: Date
  - source: 'ai' | 'manual' | 'import'
```

### Deck Entity (In-Memory)

```yaml
entity: Deck
description: Collection of cards ready for export

attributes:
  - name: string (deck name for Anki)
  - description: string? (deck description)
  - sourceLanguage: string (always 'en' for MVP)
  - targetLanguage: string (ISO 639-1 code)
  - cards: Card[]
  - createdAt: Date
```

---

## 5. Capabilities

### CAP-001: Generate Cards with AI

```yaml
capability: generate_cards_ai
id: CAP-001
description: Generate flashcards from a topic or word list using AI
actor: User
trigger: Submit generation form

input:
  mode: 'topic' | 'wordlist'
  content: string (topic description or newline-separated words)
  targetLanguage: string (ISO 639-1 code, e.g., 'es', 'fr', 'de')
  cardCount: number (5-50, default 10)

output:
  cards: Card[] (generated flashcards)

validation:
  - content must not be empty
  - content must be < 2000 characters
  - targetLanguage must be valid ISO 639-1 code
  - cardCount must be between 5 and 50

side_effects:
  - Cards added to deck store
  - API call to OpenAI

feedback:
  timing:
    input_acknowledgment: 0ms (button shows loading)
    local_render: streaming (cards appear as generated)
    server_confirm: 3-10s (full generation)
  visual:
    pending: |
      Generate button shows spinner.
      "Generating X cards for [language]..." message.
      Cards appear one by one as streamed.
    success: |
      All cards visible in preview.
      Success toast: "Generated X cards"
    error: |
      Error message below form.
      Button returns to normal.
      Previous cards preserved.
  optimistic:
    strategy: Stream cards as they're generated
    rollback: Remove partially generated cards on error

error_handling:
  EMPTY_INPUT: "Please enter a topic or word list"
  INVALID_LANGUAGE: "Please select a valid target language"
  AI_ERROR: "Failed to generate cards. Please try again."
  RATE_LIMITED: "Too many requests. Please wait a moment."
```

### CAP-002: Add Card Manually

```yaml
capability: add_card_manual
id: CAP-002
description: Manually create a single flashcard
actor: User
trigger: Submit manual card form

input:
  front: string (term in target language)
  back: string (English translation)
  example: string? (optional example sentence)
  exampleTranslation: string? (optional example translation)
  notes: string? (optional notes)

output:
  card: Card (created flashcard)

validation:
  - front must not be empty
  - back must not be empty
  - front and back must be < 500 characters each

side_effects:
  - Card added to deck store

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <50ms
  visual:
    pending: None (instant)
    success: |
      Card appears in preview list.
      Form clears for next entry.
      Brief highlight on new card.
    error: |
      Validation errors shown inline.

error_handling:
  EMPTY_FRONT: "Please enter the term"
  EMPTY_BACK: "Please enter the translation"
```

### CAP-003: Import Cards from File

```yaml
capability: import_cards_file
id: CAP-003
description: Import vocabulary from CSV or text file
actor: User
trigger: File upload

input:
  file: File (CSV or TXT)
  format: 'csv' | 'txt' | 'auto'
  hasHeader: boolean (for CSV)
  delimiter: string (for CSV, default ',')

output:
  cards: Card[] (imported flashcards)
  skipped: number (invalid rows skipped)

validation:
  - File must be < 1MB
  - File must be .csv or .txt
  - Must contain at least 1 valid row

side_effects:
  - Cards added to deck store

feedback:
  timing:
    input_acknowledgment: 0ms (file selected indicator)
    local_render: <500ms (parsing)
  visual:
    pending: |
      "Parsing file..." message
    success: |
      "Imported X cards (Y skipped)"
      Cards appear in preview.
    error: |
      "Failed to parse file: [reason]"

error_handling:
  FILE_TOO_LARGE: "File must be under 1MB"
  INVALID_FORMAT: "File must be CSV or TXT"
  NO_VALID_ROWS: "No valid flashcards found in file"
  PARSE_ERROR: "Could not parse file. Check format."
```

### CAP-004: Edit Card

```yaml
capability: edit_card
id: CAP-004
description: Edit an existing card in the deck
actor: User
trigger: Click edit on card, submit changes

input:
  cardId: string
  updates:
    front: string?
    back: string?
    example: string?
    exampleTranslation: string?
    notes: string?

output:
  card: Card (updated)

validation:
  - Card must exist
  - front and back cannot be empty if provided

side_effects:
  - Card updated in deck store

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <50ms
  visual:
    success: Card updates in place, edit modal closes
    error: Validation errors in modal

error_handling:
  CARD_NOT_FOUND: "Card not found"
```

### CAP-005: Delete Card

```yaml
capability: delete_card
id: CAP-005
description: Remove a card from the deck
actor: User
trigger: Click delete on card

input:
  cardId: string

output:
  success: boolean

validation:
  - Card must exist

side_effects:
  - Card removed from deck store

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <150ms (fade out)
  visual:
    success: Card fades out and removes from list
```

### CAP-006: Export Deck to Anki

```yaml
capability: export_deck_anki
id: CAP-006
description: Generate and download .apkg file
actor: User
trigger: Click export/download button

input:
  deckName: string
  description: string?

output:
  file: Blob (.apkg file)

validation:
  - Deck must have at least 1 card
  - deckName must not be empty

side_effects:
  - .apkg file generated server-side
  - File download triggered in browser

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <50ms (button state)
    server_confirm: 1-5s (file generation)
  visual:
    pending: |
      Export button shows spinner.
      "Generating Anki deck..." message.
    success: |
      Browser download dialog appears.
      Success toast: "Deck downloaded!"
    error: |
      Error toast with message.
      Button returns to normal.

error_handling:
  EMPTY_DECK: "Add at least one card before exporting"
  EMPTY_NAME: "Please enter a deck name"
  EXPORT_FAILED: "Failed to generate deck. Please try again."
```

---

## 6. Service Layer

### DeckStore (Zustand)

```typescript
interface Card {
  id: string;
  front: string;
  back: string;
  example?: string;
  exampleTranslation?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  source: 'ai' | 'manual' | 'import';
}

interface DeckState {
  cards: Card[];
  deckName: string;
  description: string;
  targetLanguage: string;

  // Actions
  addCards: (cards: Omit<Card, 'id' | 'createdAt'>[]) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  clearDeck: () => void;
  setDeckName: (name: string) => void;
  setTargetLanguage: (lang: string) => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  cards: [],
  deckName: 'My Language Deck',
  description: '',
  targetLanguage: 'es',

  addCards: (newCards) => set((state) => ({
    cards: [
      ...state.cards,
      ...newCards.map(card => ({
        ...card,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      })),
    ],
  })),

  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map(card =>
      card.id === id ? { ...card, ...updates } : card
    ),
  })),

  removeCard: (id) => set((state) => ({
    cards: state.cards.filter(card => card.id !== id),
  })),

  clearDeck: () => set({ cards: [] }),

  setDeckName: (name) => set({ deckName: name }),

  setTargetLanguage: (lang) => set({ targetLanguage: lang }),
}));
```

### AIService

```typescript
interface GenerateRequest {
  mode: 'topic' | 'wordlist';
  content: string;
  targetLanguage: string;
  cardCount: number;
}

interface GeneratedCard {
  front: string;
  back: string;
  example: string;
  exampleTranslation: string;
}

export async function generateCards(
  request: GenerateRequest,
  onCard?: (card: GeneratedCard) => void
): Promise<GeneratedCard[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Generation failed');
  }

  // Handle streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const cards: GeneratedCard[] = [];

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const card = JSON.parse(line.slice(6));
        cards.push(card);
        onCard?.(card);
      }
    }
  }

  return cards;
}
```

### AnkiExportService

```typescript
export async function exportToAnki(
  cards: Card[],
  deckName: string,
  description?: string
): Promise<Blob> {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards, deckName, description }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## 7. UI Components

### Main Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header: "Anki Deck Generator"                           [Language: v]      │
├────────────────────────────────────┬────────────────────────────────────────┤
│                                    │                                        │
│  INPUT PANEL                       │  PREVIEW PANEL                         │
│  ─────────────                     │  ─────────────                         │
│                                    │                                        │
│  [Tab: AI] [Tab: Manual] [Import]  │  Deck: [My Deck Name    ]              │
│                                    │  Cards: 12                             │
│  ┌──────────────────────────────┐  │                                        │
│  │ AI Generation                │  │  ┌────────────────────────────────┐   │
│  │                              │  │  │ hola                     [Edit]│   │
│  │ Mode: ○ Topic  ● Word List   │  │  │ hello                   [Del] │   │
│  │                              │  │  │ "¡Hola! ¿Cómo estás?"         │   │
│  │ ┌────────────────────────┐   │  │  └────────────────────────────────┘   │
│  │ │ Enter words, one per   │   │  │  ┌────────────────────────────────┐   │
│  │ │ line:                  │   │  │  │ gracias                  [Edit]│   │
│  │ │                        │   │  │  │ thank you               [Del] │   │
│  │ │ hola                   │   │  │  │ "Muchas gracias por tu ayuda"  │   │
│  │ │ gracias                │   │  │  └────────────────────────────────┘   │
│  │ │ amigo                  │   │  │                                        │
│  │ └────────────────────────┘   │  │  ... more cards ...                   │
│  │                              │  │                                        │
│  │ Cards to generate: [10 v]    │  │                                        │
│  │                              │  │                                        │
│  │ [    Generate Cards    ]     │  │  ┌────────────────────────────────┐   │
│  │                              │  │  │        [Export to Anki]        │   │
│  └──────────────────────────────┘  │  │        [Clear All Cards]       │   │
│                                    │  └────────────────────────────────┘   │
│                                    │                                        │
└────────────────────────────────────┴────────────────────────────────────────┘
```

### Component Tree

```
App
├── Header
│   └── LanguageSelector
├── MainLayout
│   ├── InputPanel
│   │   ├── TabNav (AI | Manual | Import)
│   │   ├── AIGenerationForm
│   │   │   ├── ModeToggle
│   │   │   ├── ContentTextarea
│   │   │   ├── CardCountSelect
│   │   │   └── GenerateButton
│   │   ├── ManualEntryForm
│   │   │   ├── FrontInput
│   │   │   ├── BackInput
│   │   │   ├── ExampleInput
│   │   │   └── AddButton
│   │   └── FileImportForm
│   │       ├── FileDropzone
│   │       ├── FormatOptions
│   │       └── ImportButton
│   └── PreviewPanel
│       ├── DeckHeader
│       │   ├── DeckNameInput
│       │   └── CardCount
│       ├── CardList
│       │   └── CardItem (multiple)
│       │       ├── CardFront
│       │       ├── CardBack
│       │       ├── CardExample
│       │       ├── EditButton
│       │       └── DeleteButton
│       └── ExportSection
│           ├── ExportButton
│           └── ClearButton
└── EditCardModal
    ├── FrontInput
    ├── BackInput
    ├── ExampleInput
    ├── NotesInput
    ├── SaveButton
    └── CancelButton
```

---

## 8. API Layer

### POST /api/generate

```typescript
// pages/api/generate.ts (Next.js)
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, content, targetLanguage, cardCount } = req.body;

  // Validation
  if (!content || !targetLanguage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Set up streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const languageNames: Record<string, string> = {
    es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
    pt: 'Portuguese', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
    // ... more languages
  };

  const prompt = mode === 'topic'
    ? `Generate ${cardCount} vocabulary flashcards for learning ${languageNames[targetLanguage]} about the topic: "${content}".`
    : `Generate flashcards for these ${languageNames[targetLanguage]} words: ${content}`;

  const systemPrompt = `You are a language learning assistant. Generate flashcards in JSON format.
Each card must have:
- front: the word/phrase in ${languageNames[targetLanguage]}
- back: English translation
- example: an example sentence in ${languageNames[targetLanguage]}
- exampleTranslation: English translation of the example

Output one JSON object per line, no markdown formatting.`;

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: true,
    });

    let buffer = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      buffer += content;

      // Try to parse complete JSON objects
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const card = JSON.parse(trimmed);
            res.write(`data: ${JSON.stringify(card)}\n\n`);
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
}
```

### POST /api/export

```typescript
// pages/api/export.ts
import { createAnkiPackage } from '@/lib/anki';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, deckName, description } = req.body;

  if (!cards?.length) {
    return res.status(400).json({ error: 'No cards provided' });
  }

  if (!deckName) {
    return res.status(400).json({ error: 'Deck name required' });
  }

  try {
    const apkgBuffer = await createAnkiPackage(cards, deckName, description);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${deckName}.apkg"`);
    res.send(Buffer.from(apkgBuffer));
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
}
```

---

## 9. Database Migrations

**Not applicable** - This is a stateless application with no database. All data is held in client-side state (Zustand) and only persists until the browser tab is closed.

---

## 10. Authorization

**Not applicable** - No authentication or authorization. All users are anonymous and have full access to all features.

---

## 11. Observability

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| deck_generated_total | Counter | Total decks exported |
| cards_generated_total | Counter | Total cards generated (by source: ai/manual/import) |
| generation_duration_ms | Histogram | AI generation latency |
| export_duration_ms | Histogram | Export generation latency |
| errors_total | Counter | Error count by type |

### Log Events

| Event | Level | Context |
|-------|-------|---------|
| generation_started | info | mode, language, cardCount |
| generation_completed | info | cardCount, duration_ms |
| generation_failed | error | error, mode |
| export_completed | info | cardCount, deckName |
| export_failed | error | error |

### Error Tracking

```typescript
// Integrate with error tracking service (e.g., Sentry)
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}
```

---

## 12. Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| AI_GENERATION_ENABLED | Enable AI card generation | true |
| STREAMING_ENABLED | Stream AI responses | true |
| MAX_CARDS_PER_GENERATION | Limit cards per AI request | 50 |

---

## 13. Test Scenarios

### Unit Tests

1. **DeckStore**: Add, update, remove cards correctly
2. **FileParser**: Parse CSV with headers, without headers, tab-delimited
3. **FileParser**: Handle malformed files gracefully
4. **AnkiExport**: Generate valid SQLite structure

### Integration Tests

1. **AI Generation Flow**: Submit form → receive streamed cards → cards in store
2. **Manual Entry Flow**: Fill form → submit → card appears in preview
3. **Import Flow**: Upload file → parse → cards in preview
4. **Export Flow**: Cards in store → export → valid .apkg download

### E2E Tests

1. **Full workflow**: Generate cards → edit one → delete one → export → verify .apkg
2. **Empty state**: Cannot export with no cards
3. **Language switching**: Generate cards in multiple languages

### Error Handling Tests

1. API returns error → user sees error message
2. File parse fails → user sees specific error
3. Export fails → user can retry

---

## 14. Verification Checklist

### Pre-Implementation
- [ ] Tech stack confirmed (Next.js + TypeScript)
- [ ] OpenAI API access available
- [ ] Anki .apkg format understood

### Implementation
- [ ] All components built
- [ ] All API routes working
- [ ] All capabilities functional
- [ ] Error handling complete

### Pre-Release
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Performance acceptable (<10s generation)
- [ ] Works in major browsers

---

## 15. Implementation Priority

### Phase 1: Foundation (Day 1-2)
1. Project setup (Next.js + TypeScript + Tailwind)
2. Basic layout and routing
3. DeckStore (Zustand)
4. Manual card entry form

### Phase 2: Core Features (Day 3-5)
5. AI generation API route
6. AI generation form with streaming
7. File import (CSV/TXT parser)
8. Card preview list with edit/delete

### Phase 3: Export (Day 6-7)
9. Anki .apkg generation
10. Export API route
11. Download functionality

### Phase 4: Polish (Day 8-10)
12. Error handling
13. Loading states
14. Responsive design
15. Testing

---

## 16. Files to Create

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── generate/
│       │   └── route.ts
│       └── export/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── LanguageSelector.tsx
│   ├── InputPanel/
│   │   ├── index.tsx
│   │   ├── AIGenerationForm.tsx
│   │   ├── ManualEntryForm.tsx
│   │   └── FileImportForm.tsx
│   ├── PreviewPanel/
│   │   ├── index.tsx
│   │   ├── CardList.tsx
│   │   ├── CardItem.tsx
│   │   └── ExportSection.tsx
│   └── EditCardModal.tsx
├── stores/
│   └── deckStore.ts
├── lib/
│   ├── anki.ts          # .apkg generation
│   ├── fileParser.ts    # CSV/TXT parsing
│   └── languages.ts     # Language codes/names
└── types/
    └── index.ts
```

---

## 17. Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "openai": "^4.0.0",
    "better-sqlite3": "^9.0.0",
    "jszip": "^3.10.0",
    "papaparse": "^5.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "@types/better-sqlite3": "^7.6.0",
    "tailwindcss": "^3.3.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## 18. Compilation Summary

| Pass | Focus | Completed |
|------|-------|-----------|
| 1 | Structure | ✅ 18 sections, entities, capabilities |
| 2 | Feedback | ✅ Timing bands, streaming, optimistic UI |
| 3 | Production | ✅ Error handling, observability |
| 4 | Review | Pending approval |

### Key Decisions

1. **Stateless architecture**: No database, no auth, all client-side state
2. **Streaming AI responses**: Better UX than waiting for all cards
3. **Server-side .apkg generation**: Better-sqlite3 runs on Node.js, not browser
4. **Zustand for state**: Simple, no boilerplate, works well with React

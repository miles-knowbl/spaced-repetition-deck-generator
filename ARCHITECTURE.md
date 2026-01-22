# Architecture: Spaced Repetition Deck Generator

| Property | Value |
|----------|-------|
| **Spec Reference** | SPEC-001 |
| **Version** | 1.0 |
| **Status** | Ready for Review |
| **Date** | 2026-01-21 |

---

## Executive Summary

A stateless Next.js web application that generates Anki flashcard decks for language learners. The architecture prioritizes simplicity: no database, no authentication, minimal server-side logic. Client-side state management with Zustand, server-side API routes for AI generation and .apkg file creation.

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js App Router

**Decision:** Use Next.js 14+ with App Router

**Context:** Need a React framework with good TypeScript support, API routes, and simple deployment.

**Options Considered:**
1. Next.js App Router - Modern, streaming support, API routes built-in
2. Next.js Pages Router - Older but stable
3. Vite + Express - More control, more setup
4. Remix - Good but smaller ecosystem

**Decision:** Next.js App Router

**Rationale:**
- Built-in API routes for `/api/generate` and `/api/export`
- Streaming response support for AI generation
- Simple Vercel deployment
- Large ecosystem and community
- App Router is the recommended approach for new projects

---

### ADR-002: Zustand for State Management

**Decision:** Use Zustand for client-side state

**Context:** Need to manage deck/card state across components without prop drilling.

**Options Considered:**
1. Zustand - Minimal, no boilerplate
2. Redux Toolkit - Powerful but heavy for this use case
3. Jotai - Atomic, good but less familiar
4. React Context - Built-in but verbose for complex state

**Decision:** Zustand

**Rationale:**
- Zero boilerplate compared to Redux
- Works well with React 18 and concurrent features
- Simple API: `create()` and `useStore()`
- No providers needed
- TypeScript-first

---

### ADR-003: Server-Side .apkg Generation

**Decision:** Generate Anki packages on the server using better-sqlite3

**Context:** Anki .apkg files are ZIP archives containing SQLite databases. Need to decide where to generate them.

**Options Considered:**
1. Server-side with better-sqlite3 - Native SQLite, fast
2. Server-side with sql.js - WASM SQLite, portable
3. Client-side with sql.js - No server needed but larger bundle

**Decision:** Server-side with better-sqlite3

**Rationale:**
- better-sqlite3 is synchronous and fast
- Keeps client bundle small
- Server already needed for OpenAI API (key protection)
- Can handle larger decks without browser memory issues

**Trade-offs:**
- Requires Node.js runtime (not edge)
- Server load for export operations

---

### ADR-004: Streaming AI Responses

**Decision:** Stream OpenAI responses to show cards as they generate

**Context:** AI generation takes 3-10 seconds. Need good UX during wait.

**Options Considered:**
1. Stream cards as generated - Best UX, more complex
2. Wait for all cards - Simple, poor UX
3. Fake progress bar - Deceptive

**Decision:** Stream cards as generated

**Rationale:**
- Users see progress immediately
- Can cancel mid-generation if needed
- Feels faster than waiting
- OpenAI SDK supports streaming natively

**Implementation:**
- API route uses Server-Sent Events (SSE)
- Client reads stream and adds cards incrementally
- Each card is a complete JSON object

---

### ADR-005: No Database

**Decision:** Stateless architecture with no persistent storage

**Context:** Users don't need accounts; decks are downloaded immediately.

**Options Considered:**
1. No database - Stateless, simple
2. SQLite file per session - Temporary persistence
3. PostgreSQL/Redis - Full persistence, complex

**Decision:** No database

**Rationale:**
- Dramatically simplifies architecture
- No data privacy concerns (nothing stored)
- No backup/recovery needed
- Scales horizontally without state sync
- Users can save decks locally via .apkg export

**Trade-offs:**
- Users lose work if they close the tab
- No deck history or favorites
- Can add later if needed (localStorage first)

---

### ADR-006: Tailwind CSS

**Decision:** Use Tailwind CSS for styling

**Context:** Need a styling approach that's fast to develop and maintain.

**Options Considered:**
1. Tailwind CSS - Utility-first, fast development
2. CSS Modules - Scoped, but verbose
3. styled-components - CSS-in-JS, runtime overhead
4. Shadcn/ui + Tailwind - Component library

**Decision:** Tailwind CSS with Shadcn/ui components

**Rationale:**
- Tailwind is fast for prototyping
- Shadcn/ui provides accessible, unstyled components
- No runtime CSS-in-JS overhead
- Easy dark mode support
- Consistent design system

---

### ADR-007: Vitest for Testing

**Decision:** Use Vitest for unit and integration tests

**Context:** Need a testing framework compatible with TypeScript and React.

**Options Considered:**
1. Vitest - Fast, Vite-native, Jest-compatible
2. Jest - Industry standard but slower
3. Playwright - E2E focused

**Decision:** Vitest for unit/integration, Playwright for E2E

**Rationale:**
- Vitest is much faster than Jest
- Native ESM support
- Compatible with Testing Library
- Same config as Vite (if we used it)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        React Application                             │   │
│  │                                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │  InputPanel   │  │ PreviewPanel  │  │  EditModal    │            │   │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘            │   │
│  │          │                  │                  │                     │   │
│  │          └──────────────────┼──────────────────┘                     │   │
│  │                             │                                         │   │
│  │                   ┌─────────▼─────────┐                              │   │
│  │                   │   Zustand Store   │                              │   │
│  │                   │                   │                              │   │
│  │                   │ cards: Card[]     │                              │   │
│  │                   │ deckName: string  │                              │   │
│  │                   │ targetLang: string│                              │   │
│  │                   └─────────┬─────────┘                              │   │
│  │                             │                                         │   │
│  └─────────────────────────────┼─────────────────────────────────────────┘   │
│                                │                                             │
│  ┌─────────────────────────────┼─────────────────────────────────────────┐   │
│  │                    Service Layer                                       │   │
│  │                             │                                          │   │
│  │    ┌────────────┐    ┌─────┴─────┐    ┌────────────┐                 │   │
│  │    │ aiService  │    │fileParser │    │ankiExport  │                 │   │
│  │    │            │    │           │    │            │                 │   │
│  │    │ POST /api/ │    │ CSV/TXT   │    │ POST /api/ │                 │   │
│  │    │ generate   │    │ parsing   │    │ export     │                 │   │
│  │    └─────┬──────┘    └───────────┘    └─────┬──────┘                 │   │
│  │          │                                  │                         │   │
│  └──────────┼──────────────────────────────────┼─────────────────────────┘   │
│             │                                  │                             │
└─────────────┼──────────────────────────────────┼─────────────────────────────┘
              │                                  │
              │ HTTPS                            │ HTTPS
              │                                  │
┌─────────────┼──────────────────────────────────┼─────────────────────────────┐
│             │           SERVER                 │                             │
├─────────────┼──────────────────────────────────┼─────────────────────────────┤
│             │                                  │                             │
│   ┌─────────▼─────────┐          ┌────────────▼────────────┐               │
│   │ /api/generate     │          │ /api/export             │               │
│   │                   │          │                         │               │
│   │ - Validate input  │          │ - Validate cards        │               │
│   │ - Call OpenAI     │          │ - Create SQLite DB      │               │
│   │ - Stream response │          │ - Package as .apkg      │               │
│   │                   │          │ - Return binary         │               │
│   └─────────┬─────────┘          └────────────┬────────────┘               │
│             │                                  │                             │
│             │                    ┌─────────────┘                             │
│             │                    │                                           │
│   ┌─────────▼─────────┐    ┌─────▼─────┐                                   │
│   │    OpenAI API     │    │  SQLite   │                                   │
│   │                   │    │ (memory)  │                                   │
│   │ gpt-4-turbo       │    │           │                                   │
│   └───────────────────┘    └───────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### AI Generation Flow

```
User Input          API Route           OpenAI              Client
    │                   │                  │                   │
    │ submit form       │                  │                   │
    ├──────────────────►│                  │                   │
    │                   │ create stream    │                   │
    │                   ├─────────────────►│                   │
    │                   │                  │                   │
    │                   │◄─────────────────┤ chunk 1           │
    │                   │ SSE: card 1      │                   │
    │                   ├──────────────────┼──────────────────►│
    │                   │                  │                   │ add to store
    │                   │◄─────────────────┤ chunk 2           │
    │                   │ SSE: card 2      │                   │
    │                   ├──────────────────┼──────────────────►│
    │                   │                  │                   │ add to store
    │                   │        ...       │                   │
    │                   │                  │                   │
    │                   │◄─────────────────┤ done              │
    │                   │ SSE: [DONE]      │                   │
    │                   ├──────────────────┼──────────────────►│
    │ show success      │                  │                   │
    │◄─────────────────────────────────────┼───────────────────┤
```

### Export Flow

```
User                 Client              API Route           File System
  │                    │                     │                    │
  │ click export       │                     │                    │
  ├───────────────────►│                     │                    │
  │                    │ POST /api/export    │                    │
  │                    ├────────────────────►│                    │
  │                    │                     │ create SQLite      │
  │                    │                     ├───────────────────►│
  │                    │                     │◄───────────────────┤
  │                    │                     │ write cards        │
  │                    │                     ├───────────────────►│
  │                    │                     │◄───────────────────┤
  │                    │                     │ ZIP as .apkg       │
  │                    │                     ├───────────────────►│
  │                    │◄────────────────────┤ binary response    │
  │ download dialog    │                     │                    │
  │◄───────────────────┤                     │                    │
```

---

## File Structure

```
spaced-repetition-deck-generator/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Main page component
│   │   ├── globals.css             # Tailwind imports
│   │   └── api/
│   │       ├── generate/
│   │       │   └── route.ts        # AI generation endpoint
│   │       └── export/
│   │           └── route.ts        # .apkg export endpoint
│   │
│   ├── components/
│   │   ├── ui/                     # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── Header.tsx              # App header with language selector
│   │   ├── LanguageSelector.tsx    # Target language dropdown
│   │   │
│   │   ├── InputPanel/
│   │   │   ├── index.tsx           # Panel container with tabs
│   │   │   ├── AIGenerationForm.tsx
│   │   │   ├── ManualEntryForm.tsx
│   │   │   └── FileImportForm.tsx
│   │   │
│   │   ├── PreviewPanel/
│   │   │   ├── index.tsx           # Panel container
│   │   │   ├── DeckHeader.tsx      # Deck name, card count
│   │   │   ├── CardList.tsx        # Scrollable card list
│   │   │   ├── CardItem.tsx        # Single card display
│   │   │   └── ExportSection.tsx   # Export button
│   │   │
│   │   └── EditCardModal.tsx       # Card editing dialog
│   │
│   ├── stores/
│   │   └── deckStore.ts            # Zustand store
│   │
│   ├── lib/
│   │   ├── anki.ts                 # .apkg generation logic
│   │   ├── fileParser.ts           # CSV/TXT parsing
│   │   ├── languages.ts            # Language codes and names
│   │   └── utils.ts                # Utility functions
│   │
│   └── types/
│       └── index.ts                # TypeScript interfaces
│
├── public/
│   └── favicon.ico
│
├── tests/
│   ├── unit/
│   │   ├── deckStore.test.ts
│   │   ├── fileParser.test.ts
│   │   └── anki.test.ts
│   └── e2e/
│       └── deck-generation.spec.ts
│
├── .env.local                      # OPENAI_API_KEY
├── .env.example                    # Template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── vitest.config.ts
```

---

## API Contracts

### POST /api/generate

**Request:**
```typescript
{
  mode: 'topic' | 'wordlist';
  content: string;           // Topic or newline-separated words
  targetLanguage: string;    // ISO 639-1 (e.g., 'es', 'fr')
  cardCount: number;         // 5-50
}
```

**Response:** Server-Sent Events stream
```
data: {"front":"hola","back":"hello","example":"¡Hola! ¿Cómo estás?","exampleTranslation":"Hello! How are you?"}

data: {"front":"gracias","back":"thank you","example":"Muchas gracias.","exampleTranslation":"Thank you very much."}

data: [DONE]
```

**Errors:**
```typescript
{ error: string; code?: string }
```
- 400: Invalid input
- 429: Rate limited
- 500: OpenAI error

---

### POST /api/export

**Request:**
```typescript
{
  cards: Array<{
    front: string;
    back: string;
    example?: string;
    exampleTranslation?: string;
    notes?: string;
  }>;
  deckName: string;
  description?: string;
}
```

**Response:** Binary .apkg file
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="{deckName}.apkg"`

**Errors:**
```typescript
{ error: string }
```
- 400: No cards or missing deck name
- 500: Export failed

---

## Security Considerations

### API Key Protection
- OpenAI API key stored in environment variable
- Never exposed to client
- Rate limiting on generate endpoint

### Input Validation
- Content length limits (2000 chars)
- Card count limits (5-50)
- File size limits (1MB)
- Sanitize user input before OpenAI prompt

### No User Data Storage
- No database means no data breaches
- No cookies or tracking
- No PII collected

---

## Performance Considerations

### Client-Side
- Virtualized card list for large decks (>100 cards)
- Debounced deck name input
- Lazy load EditCardModal

### Server-Side
- Streaming reduces time-to-first-byte
- In-memory SQLite for export (no disk I/O)
- Connection pooling for OpenAI client

### Bundle Size
- Tree-shake unused Shadcn components
- Dynamic import for file parser (papaparse)
- Target: <200KB initial JS

---

## Deployment

### Vercel (Recommended)
```bash
# Environment variables
OPENAI_API_KEY=sk-...

# Build command
npm run build

# Output: .next/
```

**Considerations:**
- Use Vercel Functions (not Edge) for better-sqlite3 compatibility
- Set function timeout to 30s for AI generation
- Enable streaming responses

### Docker (Alternative)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Monitoring

### Vercel Analytics
- Page views
- Web Vitals (LCP, FID, CLS)

### Error Tracking (Optional)
```typescript
// Sentry integration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### Logging
- Structured JSON logs
- Log AI generation requests (no content, just metadata)
- Log export requests

---

## Future Considerations

If the app grows, consider:

1. **User Accounts**: Add authentication for deck history
2. **Database**: PostgreSQL for persistent decks
3. **Caching**: Redis for frequently generated words
4. **CDN**: Cache static assets
5. **Queue**: Bull for background export of large decks

These are explicitly out of scope for MVP.

# Spaced Repetition Deck Generator

Generate Anki flashcard decks for language learning with AI assistance.

## Features

- **AI Generation**: Generate flashcards from topics or word lists using GPT-4o-mini
- **Manual Entry**: Add cards one at a time with translations and example sentences
- **File Import**: Import cards from CSV or TXT files
- **Edit & Delete**: Modify or remove cards before export
- **Anki Export**: Export your deck as a `.apkg` file for direct Anki import
- **28 Languages**: Support for Spanish, French, German, Japanese, and more

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **State**: Zustand
- **AI**: OpenAI API (gpt-4o-mini)
- **Export**: better-sqlite3 + JSZip for .apkg generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/spaced-repetition-deck-generator.git
   cd spaced-repetition-deck-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### AI Generation

1. Select your target language
2. Choose mode: **Topic** (e.g., "food vocabulary") or **Word List** (paste words)
3. Select number of cards to generate
4. Click "Generate Cards"

Cards appear in real-time as they're generated via streaming.

### Manual Entry

1. Switch to the "Manual" tab
2. Enter the term in your target language
3. Enter the English translation
4. Optionally add an example sentence and its translation
5. Click "Add Card"

### File Import

1. Switch to the "Import" tab
2. Upload a CSV or TXT file
3. Format: `front,back,example,exampleTranslation` (CSV) or tab/semicolon-separated (TXT)
4. Toggle "File has header row" if applicable

### Export to Anki

1. Name your deck
2. Click "Export to Anki"
3. Import the `.apkg` file into Anki

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/    # AI card generation endpoint
│   │   └── export/      # Anki export endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── InputPanel/      # AI, Manual, Import forms
│   ├── PreviewPanel/    # Card list and export
│   └── ui/              # Reusable UI components
├── lib/
│   ├── anki.ts          # .apkg file generation
│   ├── fileParser.ts    # CSV/TXT parsing
│   ├── languages.ts     # Supported languages
│   └── utils.ts         # Utilities
├── stores/
│   └── deckStore.ts     # Zustand state management
└── types/
    └── index.ts         # TypeScript types
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for card generation |

## License

MIT

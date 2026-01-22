'use client';

import { LanguageSelector } from './LanguageSelector';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anki Deck Generator</h1>
          <p className="text-sm text-muted-foreground">
            Create flashcard decks for language learning
          </p>
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
}

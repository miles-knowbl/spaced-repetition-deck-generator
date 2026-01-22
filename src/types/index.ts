export interface Card {
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

export interface Deck {
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  cards: Card[];
  createdAt: Date;
}

export interface GenerateRequest {
  mode: 'topic' | 'wordlist';
  content: string;
  targetLanguage: string;
  cardCount: number;
}

export interface GeneratedCard {
  front: string;
  back: string;
  example: string;
  exampleTranslation: string;
}

export interface ExportRequest {
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

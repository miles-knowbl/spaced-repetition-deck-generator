import { create } from 'zustand';
import type { Card } from '@/types';

interface DeckState {
  cards: Card[];
  deckName: string;
  description: string;
  targetLanguage: string;
  isGenerating: boolean;
  isExporting: boolean;

  // Actions
  addCards: (cards: Omit<Card, 'id' | 'createdAt'>[]) => void;
  addCard: (card: Omit<Card, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  clearDeck: () => void;
  setDeckName: (name: string) => void;
  setDescription: (description: string) => void;
  setTargetLanguage: (lang: string) => void;
  setIsGenerating: (value: boolean) => void;
  setIsExporting: (value: boolean) => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  cards: [],
  deckName: 'My Language Deck',
  description: '',
  targetLanguage: 'es',
  isGenerating: false,
  isExporting: false,

  addCards: (newCards) =>
    set((state) => ({
      cards: [
        ...state.cards,
        ...newCards.map((card) => ({
          ...card,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        })),
      ],
    })),

  addCard: (card) =>
    set((state) => ({
      cards: [
        ...state.cards,
        {
          ...card,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        },
      ],
    })),

  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
    })),

  removeCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== id),
    })),

  clearDeck: () => set({ cards: [] }),

  setDeckName: (name) => set({ deckName: name }),

  setDescription: (description) => set({ description }),

  setTargetLanguage: (lang) => set({ targetLanguage: lang }),

  setIsGenerating: (value) => set({ isGenerating: value }),

  setIsExporting: (value) => set({ isExporting: value }),
}));

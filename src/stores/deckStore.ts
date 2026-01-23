import { create } from 'zustand';
import type { Card } from '@/types';

interface DeckState {
  cards: Card[];
  deckName: string;
  description: string;
  targetLanguage: string;
  isGenerating: boolean;
  isExporting: boolean;
  isTranslating: boolean;

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
  setIsTranslating: (value: boolean) => void;
  translateCards: () => Promise<void>;
  addCardsAndTranslate: (cards: Omit<Card, 'id' | 'createdAt'>[]) => Promise<{ imported: number; skipped: number } | undefined>;
}

interface ProcessedCard {
  id: string;
  front: string;
  back: string;
  originalFront: string;
  valid: boolean;
}

async function processCardsAPI(
  cards: Array<{ id: string; front: string; back: string }>,
  targetLanguage: string
): Promise<ProcessedCard[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards, targetLanguage }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Translation failed');
    }

    const data = await response.json();
    return data.cards;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Translation timed out');
    }
    throw error;
  }
}

export const useDeckStore = create<DeckState>((set, get) => ({
  cards: [],
  deckName: 'My Language Deck',
  description: '',
  targetLanguage: 'es',
  isGenerating: false,
  isExporting: false,
  isTranslating: false,

  addCards: (newCards) =>
    set((state) => ({
      cards: [
        ...newCards.map((card) => ({
          ...card,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          // Store original front for re-translation
          originalFront: card.originalFront || card.front,
        })),
        ...state.cards,
      ],
    })),

  addCard: (card) =>
    set((state) => ({
      cards: [
        {
          ...card,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          originalFront: card.originalFront || card.front,
        },
        ...state.cards,
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

  setTargetLanguage: (lang) => {
    const currentLang = get().targetLanguage;
    if (lang !== currentLang) {
      set({ targetLanguage: lang });
      // Trigger translation after language change
      get().translateCards();
    }
  },

  setIsGenerating: (value) => set({ isGenerating: value }),

  setIsExporting: (value) => set({ isExporting: value }),

  setIsTranslating: (value) => set({ isTranslating: value }),

  translateCards: async () => {
    const { cards, targetLanguage } = get();

    // Only re-translate cards that have originalFront (imported cards)
    const cardsToTranslate = cards.filter((card) => card.originalFront);

    if (cardsToTranslate.length === 0) return;

    set({ isTranslating: true });

    try {
      // For re-translation, we use originalFront (foreign) and back (english)
      const cardsForAPI = cardsToTranslate.map((card) => ({
        id: card.id,
        front: card.originalFront!, // Original foreign word
        back: card.back, // English definition
      }));

      const processed = await processCardsAPI(cardsForAPI, targetLanguage);

      // Update cards with new translations
      set((state) => ({
        cards: state.cards.map((card) => {
          const result = processed.find((p) => p.id === card.id);
          if (result && result.valid) {
            return { ...card, front: result.front };
          }
          return card;
        }),
      }));
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      set({ isTranslating: false });
    }
  },

  addCardsAndTranslate: async (newCards) => {
    const { targetLanguage } = get();

    // Add cards with temporary IDs
    const cardsWithIds = newCards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }));

    set({ isTranslating: true });
    
    let totalImported = 0;
    let totalSkipped = 0;

    try {
      // Send cards to API for processing (detect English side, normalize, translate)
      const cardsForAPI = cardsWithIds.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
      }));

      // Process in batches of 20 for large imports
      const BATCH_SIZE = 20;
      const MAX_RETRIES = 3;
      const totalBatches = Math.ceil(cardsForAPI.length / BATCH_SIZE);

      // Create batches
      const batches: Array<{ index: number; cards: typeof cardsForAPI }> = [];
      for (let i = 0; i < cardsForAPI.length; i += BATCH_SIZE) {
        batches.push({
          index: Math.floor(i / BATCH_SIZE) + 1,
          cards: cardsForAPI.slice(i, i + BATCH_SIZE),
        });
      }

      // Process batches with retry logic - add cards as each batch completes
      for (const batch of batches) {
        let success = false;
        let lastError: Error | null = null;
        let batchProcessed: ProcessedCard[] = [];

        for (let attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
          
          try {
            batchProcessed = await processCardsAPI(batch.cards, targetLanguage);
                        success = true;
          } catch (batchError) {
            lastError = batchError instanceof Error ? batchError : new Error(String(batchError));
            console.error(`Batch ${batch.index} attempt ${attempt} failed:`, lastError.message);

            if (attempt < MAX_RETRIES) {
              const waitTime = 1000 * attempt;
                            await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
        }

        if (!success) {
          console.error(`Batch ${batch.index} failed after ${MAX_RETRIES} attempts:`, lastError?.message);
          // Add unprocessed cards as-is so they're not lost
          batchProcessed = batch.cards.map(c => ({
            id: c.id,
            front: c.front,
            back: c.back,
            originalFront: c.front,
            valid: true,
          }));
        }

        // Add this batch's cards to the store immediately
        const validCards = batchProcessed.filter((p) => p.valid);
        const invalidCount = batchProcessed.length - validCards.length;
        totalImported += validCards.length;
        totalSkipped += invalidCount;

        const batchCards = validCards.map((p) => {
          const original = cardsWithIds.find((c) => c.id === p.id)!;
          return {
            ...original,
            front: p.front,
            back: p.back,
            originalFront: p.originalFront,
          };
        });

        // Add cards to store as they complete (at the top)
        if (batchCards.length > 0) {
          set((state) => ({
            cards: [...batchCards, ...state.cards],
          }));
        }

        // Small delay between batches to avoid rate limiting
        if (batch.index < totalBatches) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (totalSkipped > 0) {
              }

      return { imported: totalImported, skipped: totalSkipped };
    } catch (error) {
      console.error('Translation error:', error);
      // On error, add remaining cards without translation (at the top)
      const addedIds = new Set(get().cards.map(c => c.id));
      const remainingCards = cardsWithIds.filter(c => !addedIds.has(c.id));
      if (remainingCards.length > 0) {
        set((state) => ({
          cards: [...remainingCards, ...state.cards],
        }));
      }
      return { imported: totalImported + remainingCards.length, skipped: totalSkipped };
    } finally {
      set({ isTranslating: false });
    }
  },
}));

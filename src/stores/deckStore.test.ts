import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from './deckStore';

describe('deckStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDeckStore.setState({
      cards: [],
      deckName: 'My Language Deck',
      description: '',
      targetLanguage: 'es',
      isGenerating: false,
      isExporting: false,
    });
  });

  describe('addCard', () => {
    it('adds a card with generated id', () => {
      const { addCard, cards } = useDeckStore.getState();

      addCard({
        front: 'hola',
        back: 'hello',
        tags: [],
        source: 'manual',
      });

      const updatedCards = useDeckStore.getState().cards;
      expect(updatedCards).toHaveLength(1);
      expect(updatedCards[0]).toMatchObject({
        front: 'hola',
        back: 'hello',
        source: 'manual',
      });
      expect(updatedCards[0].id).toBeDefined();
    });

    it('adds card with optional example fields', () => {
      const { addCard } = useDeckStore.getState();

      addCard({
        front: 'hola',
        back: 'hello',
        example: '¡Hola amigo!',
        exampleTranslation: 'Hello friend!',
        tags: [],
        source: 'ai',
      });

      const card = useDeckStore.getState().cards[0];
      expect(card.example).toBe('¡Hola amigo!');
      expect(card.exampleTranslation).toBe('Hello friend!');
    });
  });

  describe('addCards', () => {
    it('adds multiple cards at once', () => {
      const { addCards } = useDeckStore.getState();

      addCards([
        { front: 'hola', back: 'hello', tags: [], source: 'import' },
        { front: 'gracias', back: 'thanks', tags: [], source: 'import' },
      ]);

      const cards = useDeckStore.getState().cards;
      expect(cards).toHaveLength(2);
    });
  });

  describe('updateCard', () => {
    it('updates an existing card', () => {
      const { addCard, updateCard } = useDeckStore.getState();

      addCard({
        front: 'hola',
        back: 'hello',
        tags: [],
        source: 'manual',
      });

      const card = useDeckStore.getState().cards[0];
      updateCard(card.id, { front: 'adiós', back: 'goodbye' });

      const updatedCard = useDeckStore.getState().cards[0];
      expect(updatedCard.front).toBe('adiós');
      expect(updatedCard.back).toBe('goodbye');
    });

    it('does not modify other cards', () => {
      const { addCards, updateCard } = useDeckStore.getState();

      addCards([
        { front: 'hola', back: 'hello', tags: [], source: 'manual' },
        { front: 'gracias', back: 'thanks', tags: [], source: 'manual' },
      ]);

      const cards = useDeckStore.getState().cards;
      updateCard(cards[0].id, { front: 'adiós' });

      const updatedCards = useDeckStore.getState().cards;
      expect(updatedCards[1].front).toBe('gracias');
    });
  });

  describe('removeCard', () => {
    it('removes a card by id', () => {
      const { addCards, removeCard } = useDeckStore.getState();

      addCards([
        { front: 'hola', back: 'hello', tags: [], source: 'manual' },
        { front: 'gracias', back: 'thanks', tags: [], source: 'manual' },
      ]);

      const cards = useDeckStore.getState().cards;
      removeCard(cards[0].id);

      const remainingCards = useDeckStore.getState().cards;
      expect(remainingCards).toHaveLength(1);
      expect(remainingCards[0].front).toBe('gracias');
    });
  });

  describe('clearDeck', () => {
    it('removes all cards', () => {
      const { addCards, clearDeck } = useDeckStore.getState();

      addCards([
        { front: 'hola', back: 'hello', tags: [], source: 'manual' },
        { front: 'gracias', back: 'thanks', tags: [], source: 'manual' },
      ]);

      clearDeck();

      expect(useDeckStore.getState().cards).toHaveLength(0);
    });
  });

  describe('setDeckName', () => {
    it('updates deck name', () => {
      const { setDeckName } = useDeckStore.getState();

      setDeckName('Spanish Vocabulary');

      expect(useDeckStore.getState().deckName).toBe('Spanish Vocabulary');
    });
  });

  describe('setTargetLanguage', () => {
    it('updates target language', () => {
      const { setTargetLanguage } = useDeckStore.getState();

      setTargetLanguage('fr');

      expect(useDeckStore.getState().targetLanguage).toBe('fr');
    });
  });

  describe('setIsGenerating', () => {
    it('toggles generating state', () => {
      const { setIsGenerating } = useDeckStore.getState();

      setIsGenerating(true);
      expect(useDeckStore.getState().isGenerating).toBe(true);

      setIsGenerating(false);
      expect(useDeckStore.getState().isGenerating).toBe(false);
    });
  });

  describe('setIsExporting', () => {
    it('toggles exporting state', () => {
      const { setIsExporting } = useDeckStore.getState();

      setIsExporting(true);
      expect(useDeckStore.getState().isExporting).toBe(true);

      setIsExporting(false);
      expect(useDeckStore.getState().isExporting).toBe(false);
    });
  });
});

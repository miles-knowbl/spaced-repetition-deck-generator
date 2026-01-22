import { describe, it, expect } from 'vitest';
import { parseFile } from './fileParser';

describe('parseFile', () => {
  describe('CSV parsing', () => {
    it('parses basic CSV with front and back', () => {
      const content = 'hola,hello\ngracias,thanks';
      const result = parseFile(content, 'test.csv', false);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]).toMatchObject({
        front: 'hola',
        back: 'hello',
      });
      expect(result.cards[1]).toMatchObject({
        front: 'gracias',
        back: 'thanks',
      });
      expect(result.skipped).toBe(0);
    });

    it('parses CSV with example sentences', () => {
      const content = 'hola,hello,¡Hola amigo!,Hello friend!';
      const result = parseFile(content, 'test.csv', false);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toMatchObject({
        front: 'hola',
        back: 'hello',
        example: '¡Hola amigo!',
        exampleTranslation: 'Hello friend!',
      });
    });

    it('skips header row when hasHeader is true', () => {
      const content = 'front,back,example\nhola,hello,¡Hola!';
      const result = parseFile(content, 'test.csv', true);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].front).toBe('hola');
    });

    it('skips rows with missing front or back', () => {
      const content = 'hola,\n,hello\ngracias,thanks';
      const result = parseFile(content, 'test.csv', false);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].front).toBe('gracias');
      expect(result.skipped).toBe(2);
    });

    it('handles quoted fields with commas', () => {
      const content = '"hello, world","hola, mundo"';
      const result = parseFile(content, 'test.csv', false);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].front).toBe('hello, world');
      expect(result.cards[0].back).toBe('hola, mundo');
    });
  });

  describe('TXT parsing', () => {
    it('parses tab-separated values', () => {
      const content = 'hola\thello\ngracias\tthanks';
      const result = parseFile(content, 'test.txt', false);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]).toMatchObject({
        front: 'hola',
        back: 'hello',
      });
    });

    it('parses semicolon-separated values', () => {
      const content = 'hola;hello\ngracias;thanks';
      const result = parseFile(content, 'test.txt', false);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]).toMatchObject({
        front: 'hola',
        back: 'hello',
      });
    });

    it('parses comma-separated values in TXT', () => {
      const content = 'hola,hello\ngracias,thanks';
      const result = parseFile(content, 'test.txt', false);

      expect(result.cards).toHaveLength(2);
    });

    it('handles example sentences in TXT', () => {
      const content = 'hola\thello\t¡Hola amigo!';
      const result = parseFile(content, 'test.txt', false);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].example).toBe('¡Hola amigo!');
    });
  });

  describe('edge cases', () => {
    it('trims whitespace from values', () => {
      const content = '  hola  ,  hello  ';
      const result = parseFile(content, 'test.csv', false);

      expect(result.cards[0].front).toBe('hola');
      expect(result.cards[0].back).toBe('hello');
    });

    it('returns empty array for empty content', () => {
      const result = parseFile('', 'test.csv', false);
      expect(result.cards).toHaveLength(0);
    });

    it('skips empty lines', () => {
      const content = 'hola,hello\n\n\ngracias,thanks';
      const result = parseFile(content, 'test.csv', false);

      expect(result.cards).toHaveLength(2);
    });
  });
});

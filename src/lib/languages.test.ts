import { describe, it, expect } from 'vitest';
import { languages, getLanguageName, isValidLanguageCode } from './languages';

describe('languages', () => {
  describe('languages array', () => {
    it('contains common languages', () => {
      const codes = languages.map((l) => l.code);

      expect(codes).toContain('es');
      expect(codes).toContain('fr');
      expect(codes).toContain('de');
      expect(codes).toContain('ja');
      expect(codes).toContain('zh');
    });

    it('has unique codes', () => {
      const codes = languages.map((l) => l.code);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('getLanguageName', () => {
    it('returns correct name for valid code', () => {
      expect(getLanguageName('es')).toBe('Spanish');
      expect(getLanguageName('fr')).toBe('French');
      expect(getLanguageName('de')).toBe('German');
    });

    it('returns "Unknown" for invalid code', () => {
      expect(getLanguageName('xyz')).toBe('Unknown');
      expect(getLanguageName('')).toBe('Unknown');
    });
  });

  describe('isValidLanguageCode', () => {
    it('returns true for valid codes', () => {
      expect(isValidLanguageCode('es')).toBe(true);
      expect(isValidLanguageCode('fr')).toBe(true);
    });

    it('returns false for invalid codes', () => {
      expect(isValidLanguageCode('xyz')).toBe(false);
      expect(isValidLanguageCode('')).toBe(false);
    });
  });
});

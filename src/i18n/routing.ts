import { defineRouting } from 'next-intl/routing';

export const locales = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'nl',
  'ru',
  'ja',
  'ko',
  'zh',
  'ar',
  'hi',
  'tr',
  'pl',
  'vi',
  'th',
  'sv',
  'da',
  'no',
  'fi',
  'el',
  'he',
  'cs',
  'ro',
  'hu',
  'id',
  'ms',
  'uk',
] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

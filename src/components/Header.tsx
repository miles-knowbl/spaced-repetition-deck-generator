'use client';

import { useTranslations } from 'next-intl';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const t = useTranslations('header');

  return (
    <header className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-primary tracking-tighter">
              暗記
            </span>
            <span className="text-muted-foreground/40 text-lg font-light">|</span>
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xs text-muted-foreground/70">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
}

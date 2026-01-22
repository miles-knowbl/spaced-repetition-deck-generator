'use client';

import { useTranslations } from 'next-intl';
import { LanguageSelector } from './LanguageSelector';
import { Languages } from 'lucide-react';

export function Header() {
  const t = useTranslations('header');

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Languages className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
}

'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useDeckStore } from '@/stores/deckStore';
import { languages } from '@/lib/languages';
import { locales } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe, BookOpen } from 'lucide-react';

export function LanguageSelector() {
  const t = useTranslations('languageSelector');
  const tLang = useTranslations('languages');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { targetLanguage, setTargetLanguage } = useDeckStore();

  const handleUILanguageChange = (newLocale: string) => {
    // Remove the current locale prefix and add the new one
    const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-4">
      {/* UI Language Selector */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={locale} onValueChange={handleUILanguageChange}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {tLang(loc)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Language Selector */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="target-language" className="text-sm whitespace-nowrap text-muted-foreground">
          {t('targetLanguage')}
        </Label>
        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
          <SelectTrigger id="target-language" className="w-[140px] h-9 text-sm">
            <SelectValue placeholder={t('selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {tLang(lang.code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

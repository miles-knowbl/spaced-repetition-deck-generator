'use client';

import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/stores/deckStore';
import { languages } from '@/lib/languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';

export function LanguageSelector() {
  const t = useTranslations('languageSelector');
  const tLang = useTranslations('languages');
  const { targetLanguage, setTargetLanguage } = useDeckStore();

  return (
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
  );
}

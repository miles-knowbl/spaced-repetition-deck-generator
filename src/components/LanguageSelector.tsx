'use client';

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

export function LanguageSelector() {
  const { targetLanguage, setTargetLanguage } = useDeckStore();

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="language" className="text-sm whitespace-nowrap">
        Learning:
      </Label>
      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
        <SelectTrigger id="language" className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

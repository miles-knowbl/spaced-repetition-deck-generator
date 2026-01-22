'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIGenerationForm } from './AIGenerationForm';
import { ManualEntryForm } from './ManualEntryForm';
import { FileImportForm } from './FileImportForm';
import { Sparkles, PenLine, Upload } from 'lucide-react';

export function InputPanel() {
  const t = useTranslations('input');

  return (
    <Card className="shadow-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wide">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="ai" className="gap-2 text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {t('tabs.ai')}
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 text-sm">
              <PenLine className="h-3.5 w-3.5" />
              {t('tabs.manual')}
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2 text-sm">
              <Upload className="h-3.5 w-3.5" />
              {t('tabs.import')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-6">
            <AIGenerationForm />
          </TabsContent>
          <TabsContent value="manual" className="mt-6">
            <ManualEntryForm />
          </TabsContent>
          <TabsContent value="import" className="mt-6">
            <FileImportForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

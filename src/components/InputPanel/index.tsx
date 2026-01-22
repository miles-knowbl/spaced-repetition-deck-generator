'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIGenerationForm } from './AIGenerationForm';
import { ManualEntryForm } from './ManualEntryForm';
import { FileImportForm } from './FileImportForm';

export function InputPanel() {
  const t = useTranslations('input');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">{t('tabs.ai')}</TabsTrigger>
            <TabsTrigger value="manual">{t('tabs.manual')}</TabsTrigger>
            <TabsTrigger value="import">{t('tabs.import')}</TabsTrigger>
          </TabsList>
          <TabsContent value="ai">
            <AIGenerationForm />
          </TabsContent>
          <TabsContent value="manual">
            <ManualEntryForm />
          </TabsContent>
          <TabsContent value="import">
            <FileImportForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIGenerationForm } from './AIGenerationForm';
import { ManualEntryForm } from './ManualEntryForm';
import { FileImportForm } from './FileImportForm';

export function InputPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">AI Generate</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
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

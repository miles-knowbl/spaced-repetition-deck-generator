'use client';

import { Header } from '@/components/Header';
import { InputPanel } from '@/components/InputPanel';
import { PreviewPanel } from '@/components/PreviewPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputPanel />
          <PreviewPanel />
        </div>
      </div>
    </main>
  );
}

import { NextRequest } from 'next/server';
import { createApkgFile } from '@/lib/anki';
import type { Card } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { deckName, description, cards } = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return Response.json({ error: 'No cards to export' }, { status: 400 });
    }

    // Validate cards have required fields
    const validCards: Card[] = cards.filter(
      (card: Card) =>
        card.front && typeof card.front === 'string' &&
        card.back && typeof card.back === 'string'
    );

    if (validCards.length === 0) {
      return Response.json(
        { error: 'No valid cards to export' },
        { status: 400 }
      );
    }

    const apkgBuffer = await createApkgFile(
      deckName || 'My Deck',
      description || '',
      validCards
    );

    return new Response(new Uint8Array(apkgBuffer), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(deckName || 'deck')}.apkg"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Failed to export deck' }, { status: 500 });
  }
}

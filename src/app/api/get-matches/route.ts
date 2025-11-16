import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  calculateFairTradeScore,
  getCategoryStats,
  getAvailableItems,
} from '@/lib/matching';
import { Item, TradeMatch } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { itemId } = await request.json();

    // Get the source item
    const itemRef = doc(db, 'items', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const sourceItem = { itemId: itemSnap.id, ...itemSnap.data() } as Item;

    // Get all available items (excluding user's own items)
    const availableItems = await getAvailableItems(sourceItem.userId);

    // Get category stats for scarcity calculation
    const categoryStats = await getCategoryStats();

    // Calculate matches
    const matches: TradeMatch[] = [];

    for (const item of availableItems) {
      const breakdown = await calculateFairTradeScore(
        sourceItem,
        item,
        categoryStats
      );

      matches.push({
        item,
        score: breakdown.finalScore,
        breakdown,
      });
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Return top 20 matches
    return NextResponse.json({
      matches: matches.slice(0, 20),
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
}


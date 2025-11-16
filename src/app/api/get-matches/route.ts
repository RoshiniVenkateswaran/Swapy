import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Item, TradeMatch, FairTradeScoreBreakdown } from '@/lib/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function calculateFairTradeScore(
  itemA: Item,
  itemB: Item,
  categoryStats: Record<string, { demand: number; supply: number }>
): Promise<FairTradeScoreBreakdown> {
  // 1. Value Similarity
  const maxValue = Math.max(itemA.estimatedValue, itemB.estimatedValue);
  const valueDiff = Math.abs(itemA.estimatedValue - itemB.estimatedValue);
  const valueSimilarity = 100 - (valueDiff / maxValue) * 100;

  // 2. Condition Compatibility
  const conditionDiff = Math.abs(itemA.conditionScore - itemB.conditionScore);
  const conditionCompatibility = 100 - conditionDiff;

  // 3. Scarcity Compatibility
  const scarcityA = categoryStats[itemA.category]
    ? categoryStats[itemA.category].supply / (categoryStats[itemA.category].demand || 1)
    : 1;
  const scarcityB = categoryStats[itemB.category]
    ? categoryStats[itemB.category].supply / (categoryStats[itemB.category].demand || 1)
    : 1;
  const minScarcity = Math.min(scarcityA, scarcityB);
  const maxScarcity = Math.max(scarcityA, scarcityB);
  const scarcityCompatibility = (minScarcity / maxScarcity) * 100;

  // 4. Demand Alignment
  const aWantsB = itemA.desiredCategories.includes(itemB.category);
  const bWantsA = itemB.desiredCategories.includes(itemA.category);
  let demandAlignment = 0;
  if (aWantsB && bWantsA) {
    demandAlignment = 100;
  } else if (aWantsB || bWantsA) {
    demandAlignment = 50;
  } else {
    demandAlignment = 0;
  }

  // Final Score
  const finalScore =
    0.4 * valueSimilarity +
    0.2 * conditionCompatibility +
    0.2 * scarcityCompatibility +
    0.2 * demandAlignment;

  return {
    valueSimilarity: Math.round(valueSimilarity),
    conditionCompatibility: Math.round(conditionCompatibility),
    scarcityCompatibility: Math.round(scarcityCompatibility),
    demandAlignment,
    finalScore: Math.round(finalScore),
  };
}

async function getCategoryStats(): Promise<Record<string, { demand: number; supply: number }>> {
  const statsSnapshot = await adminDb.collection('stats').get();
  const stats: Record<string, { demand: number; supply: number }> = {};

  statsSnapshot.forEach((doc) => {
    const data = doc.data();
    stats[data.category] = {
      demand: data.demandCount || 0,
      supply: data.supplyCount || 0,
    };
  });

  return stats;
}

async function getAvailableItems(excludeUserId?: string): Promise<Item[]> {
  const snapshot = await adminDb.collection('items').where('status', '==', 'available').get();
  const items: Item[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!excludeUserId || data.userId !== excludeUserId) {
      items.push({ itemId: doc.id, ...data } as Item);
    }
  });

  return items;
}

export async function POST(request: NextRequest) {
  try {
    const { itemId } = await request.json();

    // Get the source item
    const itemRef = adminDb.collection('items').doc(itemId);
    const itemSnap = await itemRef.get();

    if (!itemSnap.exists) {
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


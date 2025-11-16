import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  getCategoryStats,
  getAvailableItems,
  findMultiHopCycles,
  calculateChainFairnessScore,
} from '@/lib/matching';
import { Item, MultiHopCycle } from '@/lib/types';

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

    // Get all available items
    const availableItems = await getAvailableItems();

    // Add source item to the pool
    if (!availableItems.find((i) => i.itemId === sourceItem.itemId)) {
      availableItems.push(sourceItem);
    }

    // Find cycles
    const cycles = findMultiHopCycles(sourceItem, availableItems, 4);

    // Get category stats
    const categoryStats = await getCategoryStats();

    // Calculate fairness scores for each cycle
    const multiHopCycles: MultiHopCycle[] = [];

    for (const cycle of cycles) {
      const chainFairnessScore = await calculateChainFairnessScore(
        cycle,
        categoryStats
      );

      multiHopCycles.push({
        cycle,
        chainFairnessScore,
        pairScores: [], // We can calculate individual pair scores if needed
      });
    }

    // Sort by fairness score
    multiHopCycles.sort((a, b) => b.chainFairnessScore - a.chainFairnessScore);

    // Return top 10 multi-hop suggestions
    return NextResponse.json({
      multiHopCycles: multiHopCycles.slice(0, 10),
    });
  } catch (error) {
    console.error('Error finding multi-hop trades:', error);
    return NextResponse.json(
      { error: 'Failed to find multi-hop trades' },
      { status: 500 }
    );
  }
}


import { Item, FairTradeScoreBreakdown } from './types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function calculateFairTradeScore(
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

export async function getCategoryStats(): Promise<
  Record<string, { demand: number; supply: number }>
> {
  const statsCollection = collection(db, 'stats');
  const statsSnapshot = await getDocs(statsCollection);

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

export async function getAvailableItems(excludeUserId?: string): Promise<Item[]> {
  const itemsCollection = collection(db, 'items');
  const q = query(itemsCollection, where('status', '==', 'available'));
  const snapshot = await getDocs(q);

  const items: Item[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!excludeUserId || data.userId !== excludeUserId) {
      items.push({ itemId: doc.id, ...data } as Item);
    }
  });

  return items;
}

// BFS-based multi-hop detection
export function findMultiHopCycles(
  startItem: Item,
  allItems: Item[],
  maxDepth: number = 4
): Item[][] {
  const cycles: Item[][] = [];
  const visited = new Set<string>();

  function buildGraph(): Map<string, Item[]> {
    const graph = new Map<string, Item[]>();

    allItems.forEach((itemA) => {
      const neighbors: Item[] = [];
      allItems.forEach((itemB) => {
        if (
          itemA.itemId !== itemB.itemId &&
          itemA.desiredCategories.includes(itemB.category)
        ) {
          neighbors.push(itemB);
        }
      });
      graph.set(itemA.itemId, neighbors);
    });

    return graph;
  }

  function dfs(
    current: Item,
    path: Item[],
    depth: number,
    graph: Map<string, Item[]>
  ) {
    if (depth > maxDepth) return;

    const neighbors = graph.get(current.itemId) || [];

    for (const neighbor of neighbors) {
      // Check if we've completed a cycle back to start
      if (neighbor.itemId === startItem.itemId && path.length >= 2) {
        cycles.push([...path]);
        continue;
      }

      // Avoid revisiting nodes in the current path
      if (path.some((item) => item.itemId === neighbor.itemId)) {
        continue;
      }

      dfs(neighbor, [...path, neighbor], depth + 1, graph);
    }
  }

  const graph = buildGraph();
  dfs(startItem, [startItem], 1, graph);

  return cycles;
}

export async function calculateChainFairnessScore(
  cycle: Item[],
  categoryStats: Record<string, { demand: number; supply: number }>
): Promise<number> {
  const pairScores: number[] = [];

  for (let i = 0; i < cycle.length; i++) {
    const itemA = cycle[i];
    const itemB = cycle[(i + 1) % cycle.length];
    const breakdown = await calculateFairTradeScore(itemA, itemB, categoryStats);
    pairScores.push(breakdown.finalScore);
  }

  const average = pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length;
  return Math.round(average);
}


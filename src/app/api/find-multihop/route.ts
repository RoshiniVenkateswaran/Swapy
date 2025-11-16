import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * MULTI-HOP MATCHING ENGINE
 * 
 * Finds circular trade chains: A → B → C → A
 * 
 * Algorithm:
 * 1. Build a directed graph of all possible trades
 * 2. Find cycles using DFS (Depth-First Search)
 * 3. Calculate chain fairness score
 * 4. Return valid multi-hop suggestions
 */

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Item {
  itemId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  desiredCategories: string[];
  conditionScore: number;
  estimatedValue: number;
  imageUrl: string;
  status: string;
}

interface TradeNode {
  item: Item;
  wantsFrom: string[]; // User IDs this user wants to trade with
}

interface TradeChain {
  chainId: string;
  items: Item[];
  userIds: string[];
  chainLength: number;
  chainFairnessScore: number;
  totalValueDifference: number;
  reasoning: string;
}

// Configuration
const CONFIG = {
  MAX_CHAIN_LENGTH: 4, // Max A→B→C→D→A (4 people)
  MIN_CHAIN_LENGTH: 3, // Min A→B→C→A (3 people)
  MAX_VALUE_VARIANCE: 25, // Max 25% difference in chain
  MIN_CHAIN_SCORE: 60, // Minimum fairness score
  MAX_CHAINS_TO_RETURN: 10,
};

export async function POST(request: NextRequest) {
  try {
    const { itemId, userId } = await request.json();

    if (!itemId || !userId) {
      return NextResponse.json(
        { error: 'Missing itemId or userId' },
        { status: 400 }
      );
    }

    console.log('🔄 Finding multi-hop trades for item:', itemId);

    // Step 1: Fetch the source item
    const sourceItemDoc = await adminDb.collection('items').doc(itemId).get();
    
    if (!sourceItemDoc.exists) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const sourceItem = {
      itemId: sourceItemDoc.id,
      ...sourceItemDoc.data(),
    } as Item;

    console.log('📦 Source item:', sourceItem.name);

    // Step 2: Fetch all available items
    const allItemsSnapshot = await adminDb
      .collection('items')
      .where('status', '==', 'available')
      .get();

    const allItems: Item[] = [];
    allItemsSnapshot.forEach((doc) => {
      const item = { itemId: doc.id, ...doc.data() } as Item;
      allItems.push(item);
    });

    console.log('📊 Total available items:', allItems.length);

    // Step 3: Build trade graph
    const tradeGraph = buildTradeGraph(allItems);
    console.log('🕸️ Trade graph built with', Object.keys(tradeGraph).length, 'nodes');

    // Step 4: Find cycles starting from source user
    const cycles = findTradeCycles(userId, sourceItem, tradeGraph, allItems);
    console.log('🔍 Found', cycles.length, 'potential cycles');

    // Step 5: Calculate fairness scores for each cycle
    const validChains: TradeChain[] = [];
    
    for (const cycle of cycles) {
      const chain = calculateChainScore(cycle, allItems);
      
      if (chain && chain.chainFairnessScore >= CONFIG.MIN_CHAIN_SCORE) {
        validChains.push(chain);
      }
    }

    // Step 6: Sort by fairness score
    validChains.sort((a, b) => b.chainFairnessScore - a.chainFairnessScore);

    // Step 7: Limit results
    const topChains = validChains.slice(0, CONFIG.MAX_CHAINS_TO_RETURN);

    console.log('✅ Valid multi-hop chains found:', topChains.length);

    return NextResponse.json({
      success: true,
      itemId,
      userId,
      totalCycles: cycles.length,
      validChains: topChains.length,
      chains: topChains,
    });

  } catch (error: any) {
    console.error('❌ Error in multi-hop matching:', error);
    return NextResponse.json(
      { error: 'Failed to find multi-hop trades', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Build a directed graph of possible trades
 * Node: User ID
 * Edge: User A wants item from User B
 */
function buildTradeGraph(allItems: Item[]): Record<string, TradeNode> {
  const graph: Record<string, TradeNode> = {};

  // Initialize nodes
  for (const item of allItems) {
    if (!graph[item.userId]) {
      graph[item.userId] = {
        item,
        wantsFrom: [],
      };
    }
  }

  // Build edges (who wants to trade with whom)
  for (const item of allItems) {
    if (!item.desiredCategories || item.desiredCategories.length === 0) {
      continue;
    }

    // Find all users who have items this user wants
    for (const otherItem of allItems) {
      if (item.userId === otherItem.userId) continue; // Skip same user

      // Check if this item's owner wants the other user's item category
      if (item.desiredCategories.includes(otherItem.category)) {
        if (!graph[item.userId].wantsFrom.includes(otherItem.userId)) {
          graph[item.userId].wantsFrom.push(otherItem.userId);
        }
      }
    }
  }

  return graph;
}

/**
 * Find all cycles starting from sourceUserId using DFS
 */
function findTradeCycles(
  sourceUserId: string,
  sourceItem: Item,
  graph: Record<string, TradeNode>,
  allItems: Item[]
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(currentUserId: string, depth: number) {
    // Add current user to path
    path.push(currentUserId);
    visited.add(currentUserId);

    // Check if we found a cycle back to source
    if (
      depth >= CONFIG.MIN_CHAIN_LENGTH &&
      depth <= CONFIG.MAX_CHAIN_LENGTH
    ) {
      const node = graph[currentUserId];
      if (node && node.wantsFrom.includes(sourceUserId)) {
        // Found a valid cycle!
        cycles.push([...path]);
      }
    }

    // Continue DFS if not at max depth
    if (depth < CONFIG.MAX_CHAIN_LENGTH) {
      const node = graph[currentUserId];
      if (node) {
        for (const nextUserId of node.wantsFrom) {
          if (!visited.has(nextUserId) && nextUserId !== sourceUserId) {
            dfs(nextUserId, depth + 1);
          }
        }
      }
    }

    // Backtrack
    path.pop();
    visited.delete(currentUserId);
  }

  // Start DFS from source user
  dfs(sourceUserId, 1);

  return cycles;
}

/**
 * Calculate fairness score for a complete trade chain
 */
function calculateChainScore(
  userIds: string[],
  allItems: Item[]
): TradeChain | null {
  // Get items for each user in the chain
  const chainItems: Item[] = [];
  
  for (const userId of userIds) {
    const item = allItems.find((i) => i.userId === userId && i.status === 'available');
    if (!item) return null; // Invalid chain
    chainItems.push(item);
  }

  // Calculate metrics
  const values = chainItems.map((i) => i.estimatedValue);
  const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  // Value variance check
  const valueVariance = ((maxValue - minValue) / avgValue) * 100;
  if (valueVariance > CONFIG.MAX_VALUE_VARIANCE) {
    return null; // Too much value difference
  }

  // Calculate fairness score
  let fairnessScore = 100;
  const reasoning: string[] = [];

  // 1. Value balance (40 points)
  if (valueVariance <= 10) {
    reasoning.push('Excellent value balance');
  } else if (valueVariance <= 15) {
    fairnessScore -= 10;
    reasoning.push('Good value balance');
  } else if (valueVariance <= 20) {
    fairnessScore -= 20;
    reasoning.push('Fair value balance');
  } else {
    fairnessScore -= 30;
    reasoning.push('Some value differences');
  }

  // 2. Chain length bonus/penalty (20 points)
  if (userIds.length === 3) {
    reasoning.push('Simple 3-way trade');
  } else if (userIds.length === 4) {
    fairnessScore -= 10;
    reasoning.push('Complex 4-way trade');
  }

  // 3. Condition similarity (20 points)
  const conditions = chainItems.map((i) => i.conditionScore);
  const avgCondition = conditions.reduce((sum, c) => sum + c, 0) / conditions.length;
  const conditionVariance = Math.max(...conditions) - Math.min(...conditions);
  
  if (conditionVariance <= 1) {
    reasoning.push('Similar conditions');
  } else if (conditionVariance <= 2) {
    fairnessScore -= 5;
    reasoning.push('Minor condition differences');
  } else {
    fairnessScore -= 15;
    reasoning.push('Varied conditions');
  }

  // 4. Category match (20 points)
  let categoryMatches = 0;
  for (let i = 0; i < chainItems.length; i++) {
    const currentItem = chainItems[i];
    const nextItem = chainItems[(i + 1) % chainItems.length]; // Circular
    
    if (currentItem.desiredCategories?.includes(nextItem.category)) {
      categoryMatches++;
    }
  }

  if (categoryMatches === chainItems.length) {
    reasoning.push('Perfect category match chain!');
  } else if (categoryMatches >= chainItems.length - 1) {
    fairnessScore -= 10;
    reasoning.push('Good category matches');
  } else {
    fairnessScore -= 20;
    reasoning.push('Some category mismatches');
  }

  const chain: TradeChain = {
    chainId: userIds.join('_'),
    items: chainItems,
    userIds,
    chainLength: userIds.length,
    chainFairnessScore: Math.max(0, Math.round(fairnessScore)),
    totalValueDifference: maxValue - minValue,
    reasoning: reasoning.join(', '),
  };

  return chain;
}


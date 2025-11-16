import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * PHASE 2: MATCHING ENGINE
 * 
 * This API finds potential trade matches for a given item:
 * 1. Fetches all available candidate items
 * 2. Filters out invalid matches
 * 3. Calculates fairness scores
 * 4. Returns ranked 1-to-1 matches
 */

interface Item {
  itemId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  desiredCategories: string[];
  conditionScore: number;
  estimatedValue: number;
  keywords: string[];
  attributes: Record<string, any>;
  imageUrl: string;
  status: string;
  createdAt: any;
}

interface Match {
  matchId: string;
  item1: Item;
  item2: Item;
  fairTradeScore: number;
  categoryMatch: boolean;
  valueDifference: number;
  conditionDifference: number;
  mutualInterest: boolean;
  reasoning: string;
}

// Configuration
const CONFIG = {
  MAX_VALUE_DIFFERENCE_PERCENT: 30, // 30% max difference
  MIN_FAIR_TRADE_SCORE: 50, // Minimum score to show
  MAX_MATCHES_TO_RETURN: 20,
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

    console.log('🔍 Finding matches for item:', itemId);

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

    // Step 2: Fetch all available candidate items
    const candidatesSnapshot = await adminDb
      .collection('items')
      .where('status', '==', 'available')
      .get();

    console.log('📊 Total available items:', candidatesSnapshot.size);

    // Step 3: Filter candidates
    const candidates: Item[] = [];
    candidatesSnapshot.forEach((doc) => {
      const item = { itemId: doc.id, ...doc.data() } as Item;
      
      // Filter out:
      // 1. Same user's items
      if (item.userId === userId) {
        return;
      }

      // 2. Same item
      if (item.itemId === itemId) {
        return;
      }

      // 3. Items with too large value difference
      const valueDiff = Math.abs(item.estimatedValue - sourceItem.estimatedValue);
      const valuePercent = (valueDiff / sourceItem.estimatedValue) * 100;
      if (valuePercent > CONFIG.MAX_VALUE_DIFFERENCE_PERCENT) {
        return;
      }

      // 4. Items not in relevant categories (if user specified desired categories)
      if (sourceItem.desiredCategories && sourceItem.desiredCategories.length > 0) {
        if (!sourceItem.desiredCategories.includes(item.category)) {
          // Still include but penalize in scoring
        }
      }

      candidates.push(item);
    });

    console.log('✅ Filtered candidates:', candidates.length);

    // Step 4: Calculate fairness scores for each candidate
    const matches: Match[] = [];

    for (const candidate of candidates) {
      const match = await calculateMatch(sourceItem, candidate);
      
      // Only include matches above minimum threshold
      if (match.fairTradeScore >= CONFIG.MIN_FAIR_TRADE_SCORE) {
        matches.push(match);
      }
    }

    // Step 5: Sort by fairness score (highest first)
    matches.sort((a, b) => b.fairTradeScore - a.fairTradeScore);

    // Step 6: Limit results
    const topMatches = matches.slice(0, CONFIG.MAX_MATCHES_TO_RETURN);

    console.log('🎯 Top matches found:', topMatches.length);

    return NextResponse.json({
      success: true,
      itemId,
      totalCandidates: candidates.length,
      totalMatches: matches.length,
      matches: topMatches,
    });

  } catch (error: any) {
    console.error('❌ Error in matching engine:', error);
    return NextResponse.json(
      { error: 'Failed to find matches', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate fairness score between two items
 * Returns a Match object with detailed scoring
 */
async function calculateMatch(item1: Item, item2: Item): Promise<Match> {
  let fairTradeScore = 0;
  const reasoning: string[] = [];

  // 1. VALUE SIMILARITY (40 points max)
  const valueDiff = Math.abs(item1.estimatedValue - item2.estimatedValue);
  const avgValue = (item1.estimatedValue + item2.estimatedValue) / 2;
  const valuePercent = (valueDiff / avgValue) * 100;

  let valueScore = 0;
  if (valuePercent <= 5) {
    valueScore = 40;
    reasoning.push('Almost identical value');
  } else if (valuePercent <= 10) {
    valueScore = 35;
    reasoning.push('Very close value');
  } else if (valuePercent <= 20) {
    valueScore = 25;
    reasoning.push('Similar value');
  } else if (valuePercent <= 30) {
    valueScore = 15;
    reasoning.push('Acceptable value difference');
  } else {
    valueScore = 5;
    reasoning.push('Larger value difference');
  }

  fairTradeScore += valueScore;

  // 2. CONDITION SIMILARITY (20 points max)
  const conditionDiff = Math.abs(item1.conditionScore - item2.conditionScore);
  let conditionScore = 0;
  
  if (conditionDiff <= 1) {
    conditionScore = 20;
    reasoning.push('Same condition quality');
  } else if (conditionDiff <= 2) {
    conditionScore = 15;
    reasoning.push('Similar condition');
  } else if (conditionDiff <= 3) {
    conditionScore = 10;
    reasoning.push('Acceptable condition difference');
  } else {
    conditionScore = 5;
    reasoning.push('Different condition levels');
  }

  fairTradeScore += conditionScore;

  // 3. CATEGORY MATCH (25 points max)
  let categoryScore = 0;
  let categoryMatch = false;
  let mutualInterest = false;

  // Check if item1 wants item2's category
  const item1WantsItem2 = item1.desiredCategories?.includes(item2.category) || false;
  
  // Check if item2 wants item1's category
  const item2WantsItem1 = item2.desiredCategories?.includes(item1.category) || false;

  if (item1WantsItem2 && item2WantsItem1) {
    categoryScore = 25;
    categoryMatch = true;
    mutualInterest = true;
    reasoning.push('Perfect mutual interest!');
  } else if (item1WantsItem2) {
    categoryScore = 15;
    categoryMatch = true;
    reasoning.push('You want their category');
  } else if (item2WantsItem1) {
    categoryScore = 15;
    categoryMatch = true;
    reasoning.push('They want your category');
  } else if (item1.category === item2.category) {
    categoryScore = 10;
    reasoning.push('Same category');
  } else {
    categoryScore = 5;
    reasoning.push('Different categories');
  }

  fairTradeScore += categoryScore;

  // 4. KEYWORD SIMILARITY (15 points max)
  const keywords1 = item1.keywords || [];
  const keywords2 = item2.keywords || [];
  
  const commonKeywords = keywords1.filter(k => keywords2.includes(k));
  const keywordScore = Math.min(commonKeywords.length * 3, 15);
  
  if (commonKeywords.length > 0) {
    reasoning.push(`${commonKeywords.length} common keywords`);
  }

  fairTradeScore += keywordScore;

  // Generate match object
  const match: Match = {
    matchId: `${item1.itemId}_${item2.itemId}`,
    item1,
    item2,
    fairTradeScore: Math.round(fairTradeScore),
    categoryMatch,
    valueDifference: valueDiff,
    conditionDifference: conditionDiff,
    mutualInterest,
    reasoning: reasoning.join(', '),
  };

  return match;
}


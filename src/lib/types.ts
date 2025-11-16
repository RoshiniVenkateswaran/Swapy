import { Timestamp } from 'firebase/firestore';

export interface User {
  userId: string;
  name: string;
  email: string;
  campusDomain: string;
  createdAt: Timestamp;
}

export interface Item {
  itemId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  desiredCategories: string[];
  conditionScore: number;
  estimatedValue: number;
  imageUrl: string;
  status: 'available' | 'pending' | 'traded';
  createdAt: Timestamp;
  keywords?: string[];
  attributes?: Record<string, any>;
}

export interface Trade {
  tradeId: string;
  itemsInvolved: string[];
  usersInvolved: string[];
  fairnessScore: number;
  tradeType: 'single' | 'multi';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  cycleOrder?: string[]; // For multi-hop trades
}

export interface CategoryStats {
  category: string;
  demandCount: number;
  supplyCount: number;
}

export interface AIAnalysisResult {
  category: string;
  conditionScore: number;
  keywords: string[];
  attributes: Record<string, any>;
  estimatedValue?: number;
}

export interface FairTradeScoreBreakdown {
  valueSimilarity: number;
  conditionCompatibility: number;
  scarcityCompatibility: number;
  demandAlignment: number;
  finalScore: number;
}

export interface TradeMatch {
  item: Item;
  score: number;
  breakdown: FairTradeScoreBreakdown;
}

export interface MultiHopCycle {
  cycle: Item[];
  chainFairnessScore: number;
  pairScores: number[];
}


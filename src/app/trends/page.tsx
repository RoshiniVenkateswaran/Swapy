'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import GradientBadge from '@/components/ui/GradientBadge';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item, Trade } from '@/lib/types';

interface CategoryScore {
  category: string;
  demandScore: number;
  supplyScore: number;
  scarcityScore: number;
  popularityScore: number;
  velocityScore: number;
  saturationScore: number;
}

export default function TrendsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);

  useEffect(() => {
    loadTrendsData();
  }, []);

  const loadTrendsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data from Firestore
      const [items, trades] = await Promise.all([
        fetchAllItems(),
        fetchAllTrades(),
      ]);

      // Calculate all scores
      const scores = await calculateCategoryScores(items, trades);
      setCategoryScores(scores);
      
    } catch (error) {
      console.error('Error loading trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all items from Firestore
  const fetchAllItems = async (): Promise<Item[]> => {
    const itemsRef = collection(db, 'items');
    const itemsSnapshot = await getDocs(itemsRef);
    
    const allItems: Item[] = [];
    itemsSnapshot.forEach((doc) => {
      const itemData = { itemId: doc.id, ...doc.data() } as Item;
      allItems.push(itemData);
    });
    
    return allItems;
  };

  // Fetch all trades from Firestore
  const fetchAllTrades = async (): Promise<Trade[]> => {
    try {
      const tradesRef = collection(db, 'trades');
      const tradesSnapshot = await getDocs(tradesRef);
      
      const allTrades: Trade[] = [];
      tradesSnapshot.forEach((doc) => {
        const tradeData = { tradeId: doc.id, ...doc.data() } as Trade;
        allTrades.push(tradeData);
      });
      
      return allTrades;
    } catch (error) {
      console.warn('Error fetching trades:', error);
      return [];
    }
  };

  // Fetch search logs (if they exist)
  const fetchSearchLogs = async (): Promise<Record<string, { total: number; last7Days: number; last30Days: number }>> => {
    try {
      // Check if searches collection exists - if not, return empty object
      const searchesRef = collection(db, 'searches');
      const searchesSnapshot = await getDocs(searchesRef);
      
      const searchCounts: Record<string, { total: number; last7Days: number; last30Days: number }> = {};
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      
      searchesSnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category?.toLowerCase();
        const timestamp = data.timestamp?.toMillis?.() || data.createdAt?.toMillis?.() || now;
        
        if (category) {
          if (!searchCounts[category]) {
            searchCounts[category] = { total: 0, last7Days: 0, last30Days: 0 };
          }
          searchCounts[category].total++;
          if (timestamp >= sevenDaysAgo) searchCounts[category].last7Days++;
          if (timestamp >= thirtyDaysAgo) searchCounts[category].last30Days++;
        }
      });
      
      return searchCounts;
    } catch (error) {
      // Collection doesn't exist - return empty
      return {};
    }
  };

  // Fetch wishlist data (if it exists)
  const fetchWishlistData = async (): Promise<Record<string, number>> => {
    try {
      const wishlistsRef = collection(db, 'wishlists');
      const wishlistsSnapshot = await getDocs(wishlistsRef);
      
      const wishlistCounts: Record<string, number> = {};
      
      wishlistsSnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category?.toLowerCase() || data.desiredCategory?.toLowerCase();
        
        if (category) {
          wishlistCounts[category] = (wishlistCounts[category] || 0) + 1;
        }
      });
      
      return wishlistCounts;
    } catch (error) {
      // Collection doesn't exist - return empty
      return {};
    }
  };

  // Calculate all 6 scores for each category
  const calculateCategoryScores = async (
    items: Item[],
    trades: Trade[]
  ): Promise<CategoryScore[]> => {
    // Fetch optional data
    const [searchLogs, wishlistData] = await Promise.all([
      fetchSearchLogs(),
      fetchWishlistData(),
    ]);

    // Get all unique categories
    const categorySet = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        categorySet.add(item.category.toLowerCase());
      }
    });

    const categories = Array.from(categorySet);
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Calculate per-category metrics
    const categoryMetrics: Record<string, {
      activeListings: number;
      totalSearches: number;
      searchesLast7Days: number;
      searchesLast30Days: number;
      totalWishlisted: number;
      swapRequests: number;
      completedTrades14Days: number;
    }> = {};

    // Initialize all categories
    categories.forEach((cat) => {
      categoryMetrics[cat] = {
        activeListings: 0,
        totalSearches: 0,
        searchesLast7Days: 0,
        searchesLast30Days: 0,
        totalWishlisted: 0,
        swapRequests: 0,
        completedTrades14Days: 0,
      };
    });

    // Count active listings
    items.forEach((item) => {
      if (item.category && item.status === 'available') {
        const cat = item.category.toLowerCase();
        if (categoryMetrics[cat]) {
          categoryMetrics[cat].activeListings++;
        }
      }
    });

    // Count searches (from search logs if available)
    Object.entries(searchLogs).forEach(([category, data]) => {
      const cat = category.toLowerCase();
      if (categoryMetrics[cat]) {
        categoryMetrics[cat].totalSearches = data.total || 0;
        categoryMetrics[cat].searchesLast7Days = data.last7Days || 0;
        categoryMetrics[cat].searchesLast30Days = data.last30Days || 0;
      }
    });

    // Count wishlisted items
    Object.entries(wishlistData).forEach(([category, count]) => {
      const cat = category.toLowerCase();
      if (categoryMetrics[cat]) {
        categoryMetrics[cat].totalWishlisted = count;
      }
    });

    // Count swap requests from desiredCategories
    items.forEach((item) => {
      if (item.desiredCategories && item.desiredCategories.length > 0) {
        item.desiredCategories.forEach((desiredCat) => {
          const cat = desiredCat.toLowerCase();
          if (categoryMetrics[cat]) {
            categoryMetrics[cat].swapRequests++;
          }
        });
      }
    });

    // Count completed trades in last 14 days
    trades.forEach((trade) => {
      if (trade.status === 'completed') {
        let tradeTime = 0;
        if (trade.createdAt) {
          if (typeof trade.createdAt.toMillis === 'function') {
            tradeTime = trade.createdAt.toMillis();
          } else if (trade.createdAt.seconds) {
            tradeTime = trade.createdAt.seconds * 1000;
          }
        }
        
        if (tradeTime >= fourteenDaysAgo && trade.itemsInvolved && trade.itemsInvolved.length > 0) {
          // Get categories of items involved in trade
          const tradeItemIds = trade.itemsInvolved;
          const tradeItems = items.filter((item) => tradeItemIds.includes(item.itemId));
          
          tradeItems.forEach((item) => {
            if (item.category) {
              const cat = item.category.toLowerCase();
              if (categoryMetrics[cat]) {
                categoryMetrics[cat].completedTrades14Days++;
              }
            }
          });
        }
      }
    });

    // Find max values for normalization
    const maxListings = Math.max(...Object.values(categoryMetrics).map((m) => m.activeListings), 1);
    const maxSearches = Math.max(...Object.values(categoryMetrics).map((m) => m.totalSearches), 1);
    const maxWishlisted = Math.max(...Object.values(categoryMetrics).map((m) => m.totalWishlisted), 1);
    const maxSwapRequests = Math.max(...Object.values(categoryMetrics).map((m) => m.swapRequests), 1);

    // Calculate all 6 scores for each category
    const scores: CategoryScore[] = categories.map((category) => {
      const metrics = categoryMetrics[category];

      // 1. Demand Score (0-100)
      const totalSearches = metrics.totalSearches || 0;
      const totalWishlisted = metrics.totalWishlisted || 0;
      const totalSwapRequests = metrics.swapRequests || 0;

      const demandScore = Math.min(
        100,
        ((totalSearches / Math.max(maxSearches, 1)) * 0.5 +
         (totalWishlisted / Math.max(maxWishlisted, 1)) * 0.3 +
         (totalSwapRequests / Math.max(maxSwapRequests, 1)) * 0.2) * 100
      );

      // 2. Supply Score (0-100)
      const supplyScore = (metrics.activeListings / maxListings) * 100;

      // 3. Scarcity Score (0-100)
      const scarcityScore = Math.max(0, Math.min(100, demandScore - supplyScore));

      // 4. Popularity Score (0-100)
      const avgDailySearches30Days = metrics.searchesLast30Days / 30;
      const searchSpikeFactor = Math.max(0, metrics.searchesLast7Days - (avgDailySearches30Days * 7));
      const maxSpike = Math.max(...Object.values(categoryMetrics).map((m) => {
        const avg = m.searchesLast30Days / 30;
        return Math.max(0, m.searchesLast7Days - (avg * 7));
      }), 1);
      const normalizedSpike = (searchSpikeFactor / maxSpike) * 100;
      
      const popularityScore = Math.min(100, (demandScore * 0.7) + (normalizedSpike * 0.3));

      // 5. Velocity Score (0-100)
      const velocityScore = metrics.activeListings > 0
        ? Math.min(100, (metrics.completedTrades14Days / metrics.activeListings) * 100)
        : 0;

      // 6. Saturation Score (0-100)
      const saturationScore = Math.max(0, Math.min(100, supplyScore - demandScore));

      return {
        category,
        demandScore: Math.round((demandScore / 100) * 5 * 10) / 10, // Convert to 0-5 scale with 1 decimal
        supplyScore: Math.round((supplyScore / 100) * 5 * 10) / 10,
        scarcityScore: Math.round((scarcityScore / 100) * 5 * 10) / 10,
        popularityScore: Math.round((popularityScore / 100) * 5 * 10) / 10,
        velocityScore: Math.round((velocityScore / 100) * 5 * 10) / 10,
        saturationScore: Math.round((saturationScore / 100) * 5 * 10) / 10,
      };
    });

    return scores;
  };

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Convert score (0-5) to star display
  const renderStars = (score: number): JSX.Element => {
    // Ensure score is between 0 and 5
    const normalizedScore = Math.max(0, Math.min(5, score));
    // Round to nearest 0.5 for cleaner display
    const roundedScore = Math.round(normalizedScore * 2) / 2;
    const fullStars = Math.floor(roundedScore);
    const hasHalfStar = (roundedScore % 1) >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-500 text-lg">★</span>
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-500 text-lg">⭐</span>
      );
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
      );
    }

    return (
      <div className="flex items-center space-x-0.5">
        {stars}
      </div>
    );
  };

  // Get score color based on value (0-5 scale)
  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-yellow-600';
    if (score >= 1) return 'text-orange-600';
    return 'text-red-600';
  };

  // Calculate sorted lists
  const topDemanded = [...categoryScores].sort((a, b) => b.demandScore - a.demandScore).slice(0, 10);
  const mostScarce = [...categoryScores].sort((a, b) => b.scarcityScore - a.scarcityScore).slice(0, 10);
  const mostSupplied = [...categoryScores].sort((a, b) => b.supplyScore - a.supplyScore).slice(0, 10);

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Campus Trends Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time analytics on trending items, categories, and market dynamics
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading trends data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Demanded Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-white/20">
                    Top Demanded Categories
                  </h2>
                  <div className="space-y-2">
                    {topDemanded.length > 0 ? (
                      topDemanded.map((score, index) => (
                        <motion.div
                          key={score.category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-between hover:bg-white/40 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="text-sm font-semibold text-gray-500 w-6">#{index + 1}</span>
                            <h3 className="text-base font-semibold text-gray-900">
                              {formatCategoryName(score.category)}
                            </h3>
                          </div>
                          {renderStars(score.demandScore)}
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8">No data available</p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Most Scarce Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <GlassCard>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-white/20">
                      Most Scarce Categories
                    </h2>
                    <div className="space-y-2">
                      {mostScarce.length > 0 ? (
                        mostScarce.map((score, index) => (
                          <motion.div
                            key={score.category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="p-3 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-between hover:bg-white/40 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-sm font-semibold text-gray-500 w-6">#{index + 1}</span>
                              <h4 className="text-sm font-semibold text-gray-900">
                                {formatCategoryName(score.category)}
                              </h4>
                            </div>
                            {renderStars(score.scarcityScore)}
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-4">No data available</p>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Most Supplied Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassCard>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-white/20">
                      Most Supplied Categories
                    </h2>
                    <div className="space-y-2">
                      {mostSupplied.length > 0 ? (
                        mostSupplied.map((score, index) => (
                          <motion.div
                            key={score.category}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="p-3 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-between hover:bg-white/40 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-sm font-semibold text-gray-500 w-6">#{index + 1}</span>
                              <h4 className="text-sm font-semibold text-gray-900">
                                {formatCategoryName(score.category)}
                              </h4>
                            </div>
                            {renderStars(score.supplyScore)}
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-4">No data available</p>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}

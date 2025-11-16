'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import GradientBadge from '@/components/ui/GradientBadge';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ITEM_CATEGORIES } from '@/lib/constants';

interface CategoryStats {
  category: string;
  supply: number;
  demand: number;
  ratio: number;
  status: 'high-demand' | 'balanced' | 'over-supply';
}

export default function HeatmapPage() {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsSnapshot = await getDocs(collection(db, 'stats'));
      const categoryData: { [key: string]: any } = {};

      statsSnapshot.forEach((doc) => {
        categoryData[doc.id] = doc.data();
      });

      const categoryStats: CategoryStats[] = ITEM_CATEGORIES.map((category) => {
        const data = categoryData[category] || { supply: 0, demand: 0 };
        const supply = data.supply || 0;
        const demand = data.demand || 0;
        const ratio = demand / (supply + 1); // Avoid division by zero

        let status: 'high-demand' | 'balanced' | 'over-supply';
        if (ratio > 1.5) status = 'high-demand';
        else if (ratio > 0.5) status = 'balanced';
        else status = 'over-supply';

        return {
          category,
          supply,
          demand,
          ratio,
          status,
        };
      }).sort((a, b) => b.ratio - a.ratio); // Sort by demand ratio

      setStats(categoryStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high-demand':
        return 'from-red-500 to-orange-500';
      case 'balanced':
        return 'from-green-500 to-emerald-500';
      case 'over-supply':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'high-demand':
        return { icon: '🔥', label: 'High Demand', variant: 'warning' as const };
      case 'balanced':
        return { icon: '✅', label: 'Balanced', variant: 'success' as const };
      case 'over-supply':
        return { icon: '📦', label: 'Over Supply', variant: 'primary' as const };
      default:
        return { icon: '➖', label: 'Unknown', variant: 'primary' as const };
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Textbooks: '📚',
      Electronics: '💻',
      Furniture: '🪑',
      Clothing: '👕',
      'Sports Equipment': '⚽',
      'School Supplies': '✏️',
      Other: '📦',
    };
    return icons[category] || '📦';
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              🗺️
            </motion.div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Campus Trading Insights</span>
            </h1>
            <p className="text-xl text-gray-700">
              Real-time demand and supply analytics for your campus
            </p>
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full glow-primary"></div>
                  <span className="text-sm text-gray-700">🔥 High Demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full glow-success"></div>
                  <span className="text-sm text-gray-700">✅ Balanced</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">📦 Over Supply</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                📊
              </motion.div>
              <p className="text-gray-700">Loading heatmap data...</p>
            </div>
          )}

          {/* Heatmap Bars */}
          {!loading && (
            <div className="space-y-6">
              {stats.map((stat, index) => {
                const badge = getStatusBadge(stat.status);
                const maxValue = Math.max(...stats.map(s => Math.max(s.supply, s.demand)));
                const supplyPercent = (stat.supply / maxValue) * 100;
                const demandPercent = (stat.demand / maxValue) * 100;

                return (
                  <motion.div
                    key={stat.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard hover className="group">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">{getCategoryIcon(stat.category)}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:gradient-text transition-all duration-300">
                              {stat.category}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Demand Ratio: {stat.ratio.toFixed(2)}x
                            </p>
                          </div>
                        </div>
                        <GradientBadge variant={badge.variant}>
                          {badge.icon} {badge.label}
                        </GradientBadge>
                      </div>

                      {/* Supply Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">📦 Supply</span>
                          <span className="text-sm font-semibold text-gray-900">{stat.supply}</span>
                        </div>
                        <div className="w-full bg-dark/50 rounded-full h-6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${supplyPercent}%` }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-end px-3`}
                          >
                            {stat.supply > 0 && (
                              <span className="text-xs font-bold text-gray-900">
                                {stat.supply}
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </div>

                      {/* Demand Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">🔥 Demand</span>
                          <span className="text-sm font-semibold text-gray-900">{stat.demand}</span>
                        </div>
                        <div className="w-full bg-dark/50 rounded-full h-6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${demandPercent}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${getStatusColor(stat.status)} flex items-center justify-end px-3`}
                          >
                            {stat.demand > 0 && (
                              <span className="text-xs font-bold text-gray-900">
                                {stat.demand}
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </div>

                      {/* Insights */}
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        whileHover={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                      >
                        <p className="text-sm text-gray-700">
                          {stat.status === 'high-demand' && (
                            `🔥 Hot category! High demand with ${stat.demand} people looking for ${stat.category.toLowerCase()}.`
                          )}
                          {stat.status === 'balanced' && (
                            `✅ Good balance between supply (${stat.supply}) and demand (${stat.demand}).`
                          )}
                          {stat.status === 'over-supply' && (
                            `📦 More supply (${stat.supply}) than demand (${stat.demand}). Consider other categories.`
                          )}
                        </p>
                      </motion.div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Summary Card */}
          {!loading && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stats.length * 0.1 + 0.5 }}
              className="mt-12"
            >
              <GlassCard className="bg-gradient-glow text-center py-8">
                <div className="text-5xl mb-4 animate-glow">✨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Want to maximize your trades?
                </h3>
                <p className="text-gray-700 mb-6">
                  Focus on high-demand categories or offer items that are in short supply!
                </p>
                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/upload'}
                    className="bg-gradient-primary text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg glow-primary"
                  >
                    📤 Upload Item
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/matches'}
                    className="glass text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-white/50"
                  >
                    🤝 Find Matches
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}

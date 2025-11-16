'use client';

import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import FloatingButton from '@/components/ui/FloatingButton';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Item {
  itemId: string;
  name: string;
  category: string;
  imageUrl: string;
  estimatedValue: number;
  conditionScore: number;
  status: string;
  createdAt: any;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeItems: 0,
    pendingTrades: 0,
    completedTrades: 0,
  });
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingItems(true);
      
      try {
        console.log('🔍 Fetching items for user:', user.uid);
        
        // Fetch active items
        const itemsQuery = query(
          collection(db, 'items'),
          where('userId', '==', user.uid),
          where('status', '==', 'available')
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        
        console.log('📦 Items found:', itemsSnapshot.size);

        // Get user's items for display
        const items: Item[] = [];
        itemsSnapshot.forEach((doc) => {
          const itemData = { itemId: doc.id, ...doc.data() } as Item;
          console.log('📝 Item:', itemData);
          items.push(itemData);
        });
        // Sort by creation date (newest first)
        items.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        
        console.log('✅ Total items to display:', items.length);
        setMyItems(items);

        // Update active items stat
        setStats(prev => ({
          ...prev,
          activeItems: itemsSnapshot.size,
        }));
      } catch (error) {
        console.error('❌ Error fetching items:', error);
      }

      // Fetch trades separately (don't let it block items display)
      try {
        // Fetch all trades involving this user
        const userTradesQuery = query(
          collection(db, 'trades'),
          where('usersInvolved', 'array-contains', user.uid)
        );
        const tradesSnapshot = await getDocs(userTradesQuery);
        
        // Filter by status in memory
        let pendingCount = 0;
        let completedCount = 0;
        
        tradesSnapshot.forEach((doc) => {
          const tradeData = doc.data();
          if (tradeData.status === 'pending') {
            pendingCount++;
          } else if (tradeData.status === 'completed') {
            completedCount++;
          }
        });

        console.log('📊 Dashboard trades for user:', {
          pending: pendingCount,
          completed: completedCount,
          total: tradesSnapshot.size
        });

        setStats(prev => ({
          ...prev,
          pendingTrades: pendingCount,
          completedTrades: completedCount,
        }));
      } catch (error) {
        console.warn('⚠️ Error fetching trades:', error);
        // Don't block the UI - trades stats will just show 0
      }

      setLoadingItems(false);
    };

    fetchData();
  }, [user]);

  const actionCards = [
    {
      title: 'Upload Item',
      description: 'Add a new item for bartering with AI analysis',
      icon: '📤',
      href: '/upload',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Find Matches',
      description: 'Discover perfect trading opportunities',
      icon: '🤝',
      href: '/matches',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Campus Trends',
      description: 'View trending items & market analytics',
      icon: '📊',
      href: '/trends',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'My Trades',
      description: 'View trade history and pending offers',
      icon: '🔄',
      href: '/trades',
      gradient: 'from-purple-500 to-indigo-500',
    },
  ];

  const statsCards = [
    {
      label: 'Active Items',
      value: stats.activeItems,
      icon: '📦',
      color: 'text-blue-400',
    },
    {
      label: 'Pending Trades',
      value: stats.pendingTrades,
      icon: '⏳',
      color: 'text-yellow-400',
    },
    {
      label: 'Completed Trades',
      value: stats.completedTrades,
      icon: '✅',
      color: 'text-green-400',
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-4"
            >
              👋
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              <span className="gradient-text">Welcome back,</span>
              <br />
              <span className="text-gray-900">
                {user?.displayName || 'Student'}!
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Find the perfect trade with AI-powered matching on your campus
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover glow className="text-center">
                  <div className="text-4xl mb-3 animate-float">{stat.icon}</div>
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-700 text-sm font-medium">
                    {stat.label}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <GlassCard
                  hover
                  onClick={() => router.push(card.href)}
                  className="h-full cursor-pointer group"
                >
                  {/* Icon with gradient background */}
                  <div className="mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} 
                        flex items-center justify-center text-3xl
                        group-hover:scale-110 transition-transform duration-300
                        shadow-lg`}
                    >
                      {card.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 text-primary group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* My Items Section - Simple Count Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            {loadingItems ? (
              <GlassCard className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-4 inline-block"
                >
                  📦
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Loading your items...
                </h3>
                <p className="text-gray-600 text-sm">
                  Please wait while we fetch your data
                </p>
              </GlassCard>
            ) : myItems.length === 0 ? (
              <GlassCard className="bg-gradient-glow text-center py-12">
                <div className="text-6xl mb-4 animate-float">📭</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Items Yet
                </h3>
                <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                  Upload your first item to start trading with AI-powered matching!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/upload')}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold shadow-xl glow-primary hover:shadow-2xl transition-all duration-300"
                >
                  📤 Upload Your First Item
                </motion.button>
              </GlassCard>
            ) : (
              <GlassCard 
                hover 
                onClick={() => router.push('/my-items')} 
                className="bg-gradient-glow cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-6xl"
                    >
                      📦
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
                        My Items
                      </h2>
                      <p className="text-gray-700 text-lg">
                        You have <span className="font-bold gradient-text text-2xl">{myItems.length}</span> {myItems.length === 1 ? 'item' : 'items'} in your inventory
                      </p>
                    </div>
                  </div>
                  <div className="text-primary text-4xl group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </main>

        {/* Floating Action Button */}
        <FloatingButton onClick={() => router.push('/upload')}>
          <span className="text-2xl">➕</span>
        </FloatingButton>
      </div>
    </PageTransition>
  );
}

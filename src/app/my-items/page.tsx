'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/lib/types';
import Image from 'next/image';
import { Trash2, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import ActionButton from '@/components/ui/ActionButton';
import PageTransition from '@/components/ui/PageTransition';
import { useRouter } from 'next/navigation';

export default function MyItemsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user) {
      console.error('❌ No user found');
      return;
    }

    try {
      console.log('🔍 Loading items for user:', user.uid);
      console.log('👤 User email:', user.email);
      
      const itemsRef = collection(db, 'items');
      const q = query(itemsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      console.log('📊 Query executed. Documents found:', snapshot.size);
      
      if (snapshot.empty) {
        console.warn('⚠️ No items found for this user. Check Firestore:');
        console.warn('   1. Go to Firebase Console → Firestore');
        console.warn('   2. Check "items" collection');
        console.warn('   3. Verify userId matches:', user.uid);
      }

      const loadedItems: Item[] = [];
      snapshot.forEach((doc) => {
        const itemData = { itemId: doc.id, ...doc.data() } as Item;
        console.log('📦 Loaded item:', {
          id: doc.id,
          name: itemData.name,
          userId: itemData.userId,
          status: itemData.status,
          category: itemData.category,
        });
        loadedItems.push(itemData);
      });

      // Sort by creation date (newest first)
      loadedItems.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      console.log('✅ Total items to display:', loadedItems.length);
      setItems(loadedItems);
    } catch (error) {
      console.error('❌ Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    setDeletingId(itemId);
    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, { status: 'deleted' }); // Soft delete
      setItems(items.filter((item) => item.itemId !== itemId));
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navbar />
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              📦
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900">Loading your items...</h2>
            <p className="text-gray-600 mt-2">Please wait</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold mb-2">
              <span className="gradient-text">My Items</span>
            </h1>
            <p className="text-gray-700 text-lg">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your inventory
            </p>
          </motion.div>

          {/* Items Grid or Empty State */}
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="bg-gradient-glow text-center py-16">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-7xl mb-6"
                  >
                    📭
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    No Items Yet
                  </h2>
                  <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto">
                    Start your trading journey by uploading your first item!
                  </p>
                  <ActionButton onClick={() => router.push('/upload')} className="inline-flex items-center space-x-2">
                    <span>✨</span>
                    <span>Upload Your First Item</span>
                  </ActionButton>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="items"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {items.map((item, index) => (
                  <motion.div key={item.itemId} variants={itemVariants}>
                    <GlassCard hover className="h-full flex flex-col group">
                      {/* Item Image */}
                      <div className="relative h-56 rounded-2xl overflow-hidden mb-4">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                              item.status === 'available'
                                ? 'bg-green-500/90 text-white'
                                : item.status === 'pending'
                                ? 'bg-yellow-500/90 text-white'
                                : 'bg-gray-500/90 text-white'
                            }`}
                          >
                            {item.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-shrink-0">
                          {item.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Value</div>
                            <div className="text-lg font-bold gradient-text">
                              ${item.estimatedValue}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Condition</div>
                            <div className="text-lg font-bold text-gray-900">
                              {item.conditionScore}/10
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Status</div>
                            <div className="text-lg">
                              {item.status === 'available' ? '✅' : item.status === 'pending' ? '⏳' : '📦'}
                            </div>
                          </div>
                        </div>

                        {/* Condition Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-4">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.conditionScore || 0) * 10}%` }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                            className="h-full bg-gradient-primary"
                          />
                        </div>

                        {/* Desired Categories */}
                        {item.desiredCategories && item.desiredCategories.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-gray-500 mb-2 flex items-center">
                              <span className="mr-1">🔄</span>
                              Looking for:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.desiredCategories.slice(0, 3).map((cat) => (
                                <span
                                  key={cat}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                                >
                                  {cat}
                                </span>
                              ))}
                              {item.desiredCategories.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                                  +{item.desiredCategories.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-auto pt-4 flex gap-2">
                          {item.status === 'available' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDelete(item.itemId)}
                                disabled={deletingId === item.itemId}
                                className="flex-1 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>{deletingId === item.itemId ? 'Removing...' : 'Remove'}</span>
                              </motion.button>
                            </>
                          )}
                          {item.status === 'pending' && (
                            <div className="flex-1 flex items-center justify-center space-x-2 text-yellow-600 py-3 rounded-xl bg-yellow-50 font-medium">
                              <AlertCircle className="w-4 h-4" />
                              <span>Trade Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  );
}


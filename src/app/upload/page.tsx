'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import ActionButton from '@/components/ui/ActionButton';
import GradientBadge from '@/components/ui/GradientBadge';
import UploadDropzone from '@/components/ui/UploadDropzone';
import PageTransition from '@/components/ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { ITEM_CATEGORIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [desiredCategories, setDesiredCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleCategory = (category: string) => {
    if (desiredCategories.includes(category)) {
      setDesiredCategories(desiredCategories.filter((c) => c !== category));
    } else {
      setDesiredCategories([...desiredCategories, category]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !user) return;

    setError('');
    setLoading(true);

    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `items/${user.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Call API to analyze item
      const response = await fetch('/api/analyze-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          itemName,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze item');
      }

      const analysisResult = await response.json();
      setAiResult(analysisResult);

      // 3. Save item to Firestore
      await addDoc(collection(db, 'items'), {
        userId: user.uid,
        name: itemName,
        category: analysisResult.category,
        description,
        desiredCategories,
        conditionScore: analysisResult.conditionScore,
        estimatedValue: analysisResult.estimatedValue,
        keywords: analysisResult.keywords || [],
        attributes: analysisResult.attributes || {},
        imageUrl,
        status: 'available',
        createdAt: Timestamp.now(),
      });

      // 4. Update stats
      await fetch('/api/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: analysisResult.category,
          action: 'increment',
        }),
      });

      setUploadComplete(true);
      setTimeout(() => {
        router.push('/my-items');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload item');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Upload Item</span>
            </h1>
            <p className="text-xl text-gray-700">
              Let AI analyze your item and find perfect matches
            </p>
          </motion.div>

          {/* Upload Form */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📝</span>
                  Item Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  {!imagePreview ? (
                    <UploadDropzone onFileSelect={handleFileSelect} />
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="relative w-full h-64 rounded-2xl overflow-hidden group"
                    >
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-4 right-4 bg-red-500/80 text-gray-900 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                      >
                        ❌ Remove
                      </button>
                    </motion.div>
                  )}

                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                      placeholder="E.g., Calculus Textbook"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl glass text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 resize-none"
                      placeholder="Describe your item's condition, features, etc."
                      required
                    />
                  </div>

                  {/* Desired Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      What are you looking for?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ITEM_CATEGORIES.map((category) => (
                        <motion.button
                          key={category}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleCategory(category)}
                          className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                            ${
                              desiredCategories.includes(category)
                                ? 'bg-gradient-primary text-gray-900 shadow-lg glow-primary'
                                : 'glass text-gray-700 hover:bg-white/50'
                            }
                          `}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <ActionButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={!imageFile || !itemName || !description || loading}
                    className="w-full"
                  >
                    {loading ? '🔄 Analyzing with AI...' : '✨ Analyze & Upload'}
                  </ActionButton>
                </form>
              </GlassCard>
            </motion.div>
          </div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <GlassCard className="text-center p-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="text-6xl mb-6"
                    >
                      🤖
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Analyzing Your Item
                    </h3>
                    <p className="text-gray-700 mb-4">
                      AI is processing your upload...
                    </p>
                    <div className="flex justify-center">
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="h-full w-1/2 bg-gradient-primary"
                        />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Overlay */}
          <AnimatePresence>
            {uploadComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <GlassCard className="text-center p-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-8xl mb-6"
                    >
                      ✅
                    </motion.div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      Upload Complete!
                    </h3>
                    <p className="text-gray-700">
                      Redirecting to your items...
                    </p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  );
}

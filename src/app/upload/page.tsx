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
  
  // New fields
  const [condition, setCondition] = useState<number>(0);
  const [ageValue, setAgeValue] = useState<number>(0);
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>('years');
  const [brand, setBrand] = useState<string>('');
  const [brandCustom, setBrandCustom] = useState<string>('');
  
  const BRANDS = ['Apple', 'Sony', 'Samsung', 'Ikea', 'Nike', 'Adidas', 'Dell', 'HP', 'Lenovo', 'Other'];

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
    
    // Validate all required fields
    if (!imageFile) {
      setError('Please upload an image of your item.');
      return;
    }
    
    if (!user) {
      setError('Please log in to upload items.');
      return;
    }
    
    if (!itemName || itemName.trim().length === 0) {
      setError('Please enter an item name.');
      return;
    }
    
    if (!description || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters) to help us analyze your item. Include features, color, condition, etc.');
      return;
    }
    
    if (!condition || condition === 0) {
      setError('Please select the condition of your item.');
      return;
    }
    
    if (!ageValue || ageValue === 0) {
      setError('Please enter the age of your item.');
      return;
    }
    
    if (!brand) {
      setError('Please select or enter the brand of your item.');
      return;
    }
    
    if (brand === 'Other' && (!brandCustom || brandCustom.trim().length === 0)) {
      setError('Please enter the brand name.');
      return;
    }
  
    setError('');
    setLoading(true);
  
    try {
      console.log('Starting upload process...');
      
      // 1. Upload image to Firebase Storage
      let imageUrl;
      try {
        const storageRef = ref(storage, `items/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        console.log('Image uploaded:', imageUrl);
      } catch (imageError: any) {
        console.error('Image upload error:', imageError);
        throw new Error('Failed to upload image. Please try uploading a clearer picture (JPG or PNG format).');
      }
  
      // Determine final brand value
      const finalBrand = brand === 'Other' ? brandCustom : brand;
      
      // 2. Call API route to analyze item
      console.log('Calling analyze API...');
      let response;
      try {
        response = await fetch('/api/analyze-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl,
            itemName,
            description,
            condition,
            ageValue,
            ageUnit,
            brand: finalBrand,
          }),
        });
      } catch (networkError: any) {
        console.error('Network error:', networkError);
        throw new Error('Network error. Please check your internet connection and try again.');
      }
  
      console.log('API response status:', response.status);
  
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, use default user-friendly message
          throw new Error('Unable to analyze your item. Please provide more details in the description field.');
        }
        
        console.error('API error:', errorData);
        // Use the user-friendly error message from API
        throw new Error(errorData.error || 'Unable to analyze your item. Please provide more details in the description.');
      }
  
      const analysisResult = await response.json();
      console.log('Analysis result:', analysisResult);
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
        condition,
        ageValue,
        ageUnit,
        brand: finalBrand,
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
      // Display the user-friendly error message
      const errorMessage = err.message || 'Failed to upload item. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
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
                      placeholder="Describe your item's condition, features, brand, color, size, etc. (minimum 10 characters)"
                      required
                      minLength={10}
                    />
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl glass text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                      required
                    >
                      <option value={0}>Select condition</option>
                      <option value={5}>5: Like New</option>
                      <option value={4}>4: Good</option>
                      <option value={3}>3: Average</option>
                      <option value={2}>2: Used</option>
                      <option value={1}>1: Poor</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age of Item *
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={ageValue || ''}
                        onChange={(e) => setAgeValue(Number(e.target.value))}
                        min="0"
                        className="flex-1 px-4 py-3 rounded-xl glass text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                        placeholder="0"
                        required
                      />
                      <select
                        value={ageUnit}
                        onChange={(e) => setAgeUnit(e.target.value as 'years' | 'months')}
                        className="px-4 py-3 rounded-xl glass text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                        required
                      >
                        <option value="years">years</option>
                        <option value="months">months</option>
                      </select>
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand *
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 mb-3"
                      required
                    >
                      <option value="">Select brand</option>
                      {BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    {brand === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3"
                      >
                        <input
                          type="text"
                          value={brandCustom}
                          onChange={(e) => setBrandCustom(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl glass text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                          placeholder="Enter brand"
                          required
                        />
                      </motion.div>
                    )}
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
                    disabled={
                      !imageFile || 
                      !itemName || 
                      !description || 
                      description.trim().length < 10 ||
                      condition === 0 || 
                      ageValue === 0 || 
                      !brand || 
                      (brand === 'Other' && !brandCustom) || 
                      loading
                    }
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

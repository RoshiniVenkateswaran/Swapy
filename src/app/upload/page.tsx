'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { ITEM_CATEGORIES } from '@/lib/constants';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

      // 2. Call Cloud Function to analyze item
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
          desiredCategories,
        }),
      });

      setUploadComplete(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/my-items');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload item');
    } finally {
      setLoading(false);
    }
  };

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Item Uploaded Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            AI Analysis Complete - Redirecting to your items...
          </p>
          {aiResult && (
            <div className="bg-white rounded-xl p-6 shadow-md text-left mt-6">
              <h3 className="font-semibold text-lg mb-4">AI Analysis Results:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Category:</strong> {aiResult.category}</p>
                <p><strong>Condition Score:</strong> {aiResult.conditionScore}/100</p>
                <p><strong>Estimated Value:</strong> ${aiResult.estimatedValue}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Item</h1>
          <p className="text-gray-600">
            AI will analyze your item and find the best matches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition">
              {imagePreview ? (
                <div className="relative w-full h-64">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              id="itemName"
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., MacBook Pro 2019"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe the item's condition, features, and any defects..."
            />
          </div>

          {/* Desired Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What are you looking for? *
            </label>
            <div className="flex flex-wrap gap-2">
              {ITEM_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    desiredCategories.includes(category)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !imageFile || desiredCategories.length === 0}
            className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <span>Upload & Analyze</span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}


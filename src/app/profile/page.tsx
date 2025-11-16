'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: any;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      console.log('🔍 Loading profile for user:', user.uid);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          displayName: userData.displayName || 'Unknown',
          email: userData.email || user.email || '',
          phone: userData.phone || 'Not provided',
          address: userData.address || 'Not provided',
          createdAt: userData.createdAt,
        });
        console.log('✅ Profile loaded');
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl glow-primary"
            >
              👤
            </motion.div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">My Profile</span>
            </h1>
            <p className="text-xl text-gray-700">
              Your account information and contact details
            </p>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <GlassCard className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mb-4 inline-block"
              >
                ⚙️
              </motion.div>
              <p className="text-gray-700">Loading your profile...</p>
            </GlassCard>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">📋</span>
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    {/* Name */}
                    <div className="bg-gradient-glow rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">👤</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            Full Name
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {profile.displayName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gradient-glow rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📧</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            Email Address
                          </p>
                          <p className="text-lg font-semibold text-gray-900 break-all">
                            {profile.email}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            ✓ Verified college email
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="bg-gradient-glow rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📱</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            Phone Number
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile.phone}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Visible to your trading partners
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gradient-glow rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🏠</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            Campus Address
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile.address}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Shared when trades are completed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Account Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">ℹ️</span>
                    Account Details
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Member Since</span>
                      <span className="text-gray-900 font-bold">
                        {formatDate(profile.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Account Type</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        Student
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-700 font-medium">User ID</span>
                      <span className="text-gray-600 text-sm font-mono">
                        {user?.uid.substring(0, 12)}...
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Privacy Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassCard className="p-6 bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🔒</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Privacy & Security
                      </h3>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>Your contact information is only shared with users you trade with</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>Contact details are shown only after trades are completed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>Your email is verified and secured with Firebase Authentication</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Future: Edit Profile Button */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-primary text-white rounded-xl font-semibold shadow-xl glow-primary hover:shadow-2xl transition-all duration-300"
                >
                  ✏️ Edit Profile
                </motion.button>
              </motion.div> */}
            </div>
          ) : (
            <GlassCard className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Not Found
              </h3>
              <p className="text-gray-700">
                Unable to load your profile information.
              </p>
            </GlassCard>
          )}
        </main>
      </div>
    </PageTransition>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';
import ActionButton from '@/components/ui/ActionButton';
import ProfileUpdateModal from '@/components/ui/ProfileUpdateModal';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({
      displayName: profile?.displayName || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    // Validation
    if (!editedProfile.displayName?.trim()) {
      setModalSuccess(false);
      setModalMessage('Name cannot be empty. Please enter your name.');
      setShowModal(true);
      return;
    }
    if (!editedProfile.phone?.trim()) {
      setModalSuccess(false);
      setModalMessage('Phone number cannot be empty. Please enter your phone number.');
      setShowModal(true);
      return;
    }
    if (!editedProfile.address?.trim()) {
      setModalSuccess(false);
      setModalMessage('Campus address cannot be empty. Please enter your address.');
      setShowModal(true);
      return;
    }

    setSaving(true);

    try {
      console.log('💾 Saving profile updates...');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: editedProfile.displayName.trim(),
        phone: editedProfile.phone.trim(),
        address: editedProfile.address.trim(),
        updatedAt: new Date(),
      });

      // Update local state
      setProfile({
        ...profile,
        displayName: editedProfile.displayName.trim(),
        phone: editedProfile.phone.trim(),
        address: editedProfile.address.trim(),
      });

      setIsEditing(false);
      setEditedProfile({});
      
      console.log('✅ Profile updated successfully');
      
      // Show success modal
      setModalSuccess(true);
      setModalMessage('Your profile has been updated successfully!');
      setShowModal(true);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      
      // Show error modal
      setModalSuccess(false);
      setModalMessage('Failed to update profile. Please try again.');
      setShowModal(true);
    } finally {
      setSaving(false);
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-3xl">📋</span>
                      Personal Information
                    </h2>
                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEdit}
                        className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                      >
                        ✏️ Edit Profile
                      </motion.button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Name */}
                    <div className="bg-gradient-glow rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">👤</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            Full Name
                          </p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.displayName || ''}
                              onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-semibold"
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <p className="text-xl font-bold text-gray-900">
                              {profile.displayName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email (Not Editable) */}
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
                            ✓ Verified college email {isEditing && '(cannot be changed)'}
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
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editedProfile.phone || ''}
                              onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-semibold"
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {profile.phone}
                            </p>
                          )}
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
                          {isEditing ? (
                            <textarea
                              value={editedProfile.address || ''}
                              onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-semibold resize-none"
                              placeholder="Enter your campus address"
                              rows={2}
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {profile.address}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1">
                            Shared when trades are completed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 mt-6 pt-6 border-t border-gray-200"
                    >
                      <ActionButton
                        onClick={handleSave}
                        loading={saving}
                        disabled={saving}
                        className="flex-1 bg-gradient-primary text-white"
                      >
                        💾 Save Changes
                      </ActionButton>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ❌ Cancel
                      </motion.button>
                    </motion.div>
                  )}
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

        {/* Update Modal */}
        <ProfileUpdateModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          success={modalSuccess}
          message={modalMessage}
        />
      </div>
    </PageTransition>
  );
}


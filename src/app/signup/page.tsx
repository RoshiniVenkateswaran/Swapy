'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ALLOWED_DOMAINS } from '@/lib/constants';
import { validatePassword, validateEduEmail, passwordsMatch } from '@/lib/auth-utils';
import { handleAuthError, handleOTPError, handleAPIError, handleFirestoreError, getErrorIcon } from '@/lib/auth-errors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpFromResponse, setOtpFromResponse] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordErrors([]);

    const emailValidation = validateEduEmail(email, ALLOWED_DOMAINS);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      return;
    }

    const passwordMatch = passwordsMatch(password, confirmPassword);
    if (!passwordMatch.match) {
      setError(passwordMatch.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      setError(passwordValidation.errors[0]);
      return;
    }

    setLoading(true);

    try {
      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) {
        const errorData = await otpResponse.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      const responseData = await otpResponse.json();
      if (responseData.otp) {
        setOtpFromResponse(responseData.otp);
      }

      setOtpSent(true);
    } catch (err: any) {
      if (err.message && err.message.includes('OTP')) {
        setError(handleOTPError(err));
      } else if (err.response || err.status) {
        setError(handleAPIError(err));
      } else {
        setError(err.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifyingOtp(true);

    try {
      const verifyResponse = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'OTP verification failed');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone || '',
        address: address || '',
        createdAt: Timestamp.now(),
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Verification error:', err);
      
      if (err.code && err.code.startsWith('auth/')) {
        setError(handleAuthError(err).userFriendly);
      } else if (err.message && err.message.includes('OTP')) {
        setError(handleOTPError(err));
      } else if (err.code && (err.code.includes('firestore') || err.code.includes('permission'))) {
        setError(handleFirestoreError(err));
      } else if (err.response || err.status) {
        setError(handleAPIError(err));
      } else {
        setError(err.message || 'An error occurred during signup');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  // OTP Verification Screen
  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl glow-primary">
              S
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">Verify Your Email</span>
            </h1>
            <p className="text-gray-700 mb-2">
              {otpFromResponse 
                ? 'Enter the verification code below:'
                : `We sent a 6-digit code to ${email}`
              }
            </p>
            {otpFromResponse && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mt-4"
              >
                <p className="text-sm text-blue-800 mb-2 font-semibold">Your verification code is:</p>
                <div className="text-4xl font-bold text-blue-600 tracking-widest font-mono mb-3">
                  {otpFromResponse}
                </div>
                <p className="text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
                  💡 Note: Resend test domain limitation. For production, verify your domain.
                </p>
              </motion.div>
            )}
          </div>

          {/* OTP Form Card */}
          <div className="glass rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 mb-2">
                  Enter Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl glass text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900"
                  placeholder="000000"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={verifyingOtp || otp.length !== 6}
                whileHover={{ scale: verifyingOtp ? 1 : 1.02 }}
                whileTap={{ scale: verifyingOtp ? 1 : 0.98 }}
                className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl shadow-lg glow-primary hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingOtp ? '🔄 Verifying...' : '✅ Verify & Create Account'}
              </motion.button>
            </form>

            <button
              onClick={() => setOtpSent(false)}
              className="w-full mt-4 text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              ← Back to signup
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Signup Form Screen
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl glow-primary"
          >
            S
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Join Swapy</span>
          </h1>
          <p className="text-gray-700">
            Create your account to start trading
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="glass rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                College Email (.edu required)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="student@university.edu"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="Create a strong password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="Confirm your password"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                Campus Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                placeholder="Dorm/Building, Room Number"
                required
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-900 mb-2">Password must contain:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ At least 8 characters</li>
                <li>✓ One uppercase letter</li>
                <li>✓ One lowercase letter</li>
                <li>✓ One number</li>
                <li>✓ One special character</li>
              </ul>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl shadow-lg glow-primary hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Sending Code...' : '📧 Send Verification Code'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

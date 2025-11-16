import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { handleOTPError, handleFirestoreError, handleAPIError } from '@/lib/auth-errors';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get OTP from Firestore
    const otpRef = doc(db, 'otps', email.toLowerCase());
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new one.' },
        { status: 400 }
      );
    }

    const otpData = otpDoc.data();
    const attempts = (otpData.attempts || 0) + 1;

    // Check max attempts
    if (attempts > MAX_ATTEMPTS) {
      await deleteDoc(otpRef);
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    const expiresAt = otpData.expiresAt.toDate();
    if (new Date() > expiresAt) {
      await deleteDoc(otpRef);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      await setDoc(otpRef, {
        ...otpData,
        attempts,
      }, { merge: true });

      return NextResponse.json(
        { error: `Invalid verification code. ${MAX_ATTEMPTS - attempts + 1} attempts remaining.` },
        { status: 400 }
      );
    }

    // OTP verified successfully - delete it
    await deleteDoc(otpRef);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    
    let errorMessage = 'Failed to verify code';
    let statusCode = 500;

    // Handle OTP-specific errors
    if (error.message && (
      error.message.includes('OTP') || 
      error.message.includes('verification') ||
      error.message.includes('expired') ||
      error.message.includes('invalid') ||
      error.message.includes('attempts')
    )) {
      errorMessage = handleOTPError(error);
      statusCode = 400;
    }
    // Handle Firestore errors
    else if (error.code && (error.code.startsWith('permission-denied') || error.code.startsWith('unavailable'))) {
      errorMessage = handleFirestoreError(error);
      statusCode = 503;
    }
    // Handle validation errors
    else if (error.message && (error.message.includes('required') || error.message.includes('missing'))) {
      errorMessage = error.message;
      statusCode = 400;
    }
    // Handle network errors
    else if (error.message && (error.message.includes('network') || error.message.includes('fetch'))) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    }
    // Generic errors
    else {
      errorMessage = handleAPIError(error) || 'Failed to verify code. Please try again.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}


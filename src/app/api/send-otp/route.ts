import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { generateOTP, validateEduEmail } from '@/lib/auth-utils';
import { ALLOWED_DOMAINS } from '@/lib/constants';
import { handleFirestoreError, handleAPIError } from '@/lib/auth-errors';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email domain
    const emailValidation = validateEduEmail(email, ALLOWED_DOMAINS);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in Firestore
    const otpRef = adminDb.collection('otps').doc(email.toLowerCase());
    await otpRef.set({
      email: email.toLowerCase(),
      otp,
      expiresAt: Timestamp.fromDate(expiresAt),
      attempts: 0,
      createdAt: Timestamp.now(),
    });

    // Send email with OTP
    let emailSent = false;
    let emailError: string | null = null;
    const resendApiKey = process.env.RESEND_API_KEY;

    // Debug: Log if API key is found (without exposing the key)
    console.log('📧 Email sending status:', {
      hasApiKey: !!resendApiKey,
      apiKeyLength: resendApiKey?.length || 0,
      email: email,
    });

    // Try Resend first (if configured)
    if (resendApiKey && resendApiKey.startsWith('re_')) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Swapy <onboarding@resend.dev>';
        
        console.log('📤 Attempting to send email via Resend...');
        
        const emailPayload = {
          from: fromEmail,
          to: email,
          subject: 'Your Swapy Verification Code',
          html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swapy Verification Code</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">Swapy</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
      <h2 style="color: #1f2937; margin-top: 0;">Your Verification Code</h2>
      <p>Thank you for signing up for Swapy! Use the code below to verify your email address:</p>
      <div style="background: white; border: 2px dashed #3B82F6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3B82F6; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        This is an automated message from Swapy. Please do not reply to this email.
      </p>
    </div>
  </body>
</html>
          `,
          text: `Your Swapy verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        };

        console.log('📤 Sending email to:', email);
        console.log('📤 From email:', fromEmail);

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        let responseData: any = {};
        const responseText = await emailResponse.text();
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (emailResponse.ok) {
          emailSent = true;
          console.log('✅ Email sent successfully via Resend!');
          console.log('✅ Email ID:', responseData.id || 'N/A');
        } else {
          // Handle specific Resend errors
          const errorMsg = responseData.message || responseData.error?.message || responseText || 'Failed to send email';
          
          // Resend limitation: can only send to verified email with test domain
          if (emailResponse.status === 403 && errorMsg.includes('own email address')) {
            console.warn('⚠️  Resend limitation: Can only send to verified email with test domain.');
            console.warn('💡 For development: OTP will be displayed on screen.');
            console.warn('💡 For production: Verify your domain at resend.com/domains');
            emailError = 'Email sending limited (using test domain). OTP displayed on screen instead.';
          } else {
            emailError = errorMsg;
          }
          
          console.error('❌ Resend API error:', {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error: responseData,
            rawResponse: responseText,
          });
        }
      } catch (err: any) {
        emailError = err.message || 'Email service error';
        console.error('❌ Email sending exception:', err);
      }
    } else {
      console.log('⚠️  RESEND_API_KEY not configured or invalid format');
      console.log('📋 OTP for', email, ':', otp);
    }

    // Return response
    const responseData: any = {
      success: true,
      message: emailSent 
        ? 'Verification code sent to your email' 
        : 'Verification code generated',
    };

    // Always include OTP if email failed (for development/testing)
    if (!emailSent) {
      responseData.otp = otp;
      
      // Provide helpful message based on error
      if (emailError && emailError.includes('own email address')) {
        responseData.note = 'Development mode: Using test domain. Enter the OTP code shown below.';
        responseData.info = 'To send actual emails, verify your domain in Resend.';
      } else if (emailError) {
        responseData.note = `Email sending failed: ${emailError}. Use the OTP code below.`;
      } else {
        responseData.note = 'Email service not configured. Use the OTP code below.';
      }
    } else {
      // Email sent successfully - still show OTP in development for testing
      if (process.env.NODE_ENV === 'development') {
        responseData.otp = otp;
        responseData.note = 'Email sent! OTP also shown below for testing.';
      }
    }

    if (emailError && !emailError.includes('own email address')) {
      responseData.warning = emailError;
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    let errorMessage = 'Failed to send verification code';
    let statusCode = 500;

    // Handle Firestore errors
    if (error.code && (error.code.startsWith('permission-denied') || error.code.startsWith('unavailable'))) {
      errorMessage = handleFirestoreError(error);
      statusCode = 503;
    }
    // Handle validation errors
    else if (error.message && error.message.includes('email')) {
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
      errorMessage = handleAPIError(error) || 'Failed to send verification code. Please try again later.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}


/**
 * Comprehensive Authentication Error Handler
 * Maps Firebase Auth error codes to user-friendly messages
 */

export interface AuthError {
  code: string;
  message: string;
  userFriendly: string;
  category: 'email' | 'password' | 'network' | 'account' | 'rate-limit' | 'unknown';
}

/**
 * Firebase Auth error codes and their user-friendly messages
 */
const AUTH_ERROR_MAP: Record<string, Omit<AuthError, 'code'>> = {
  // Email errors
  'auth/invalid-email': {
    message: 'The email address is badly formatted.',
    userFriendly: 'Please enter a valid email address.',
    category: 'email',
  },
  'auth/email-already-in-use': {
    message: 'The email address is already in use by another account.',
    userFriendly: 'An account with this email already exists. Please sign in instead.',
    category: 'email',
  },
  'auth/user-not-found': {
    message: 'There is no user record corresponding to this identifier.',
    userFriendly: 'No account found with this email address. Please sign up first.',
    category: 'email',
  },
  'auth/user-disabled': {
    message: 'The user account has been disabled by an administrator.',
    userFriendly: 'This account has been disabled. Please contact support.',
    category: 'account',
  },
  'auth/requires-recent-login': {
    message: 'This operation is sensitive and requires recent authentication.',
    userFriendly: 'Please sign out and sign back in to continue.',
    category: 'account',
  },

  // Password errors
  'auth/wrong-password': {
    message: 'The password is invalid or the user does not have a password.',
    userFriendly: 'Incorrect password. Please try again or reset your password.',
    category: 'password',
  },
  'auth/weak-password': {
    message: 'The password must be 6 characters long or more.',
    userFriendly: 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, number, and special character.',
    category: 'password',
  },
  'auth/invalid-credential': {
    message: 'The supplied auth credential is incorrect, malformed or has expired.',
    userFriendly: 'Invalid email or password. Please check your credentials and try again.',
    category: 'password',
  },

  // Network errors
  'auth/network-request-failed': {
    message: 'A network error (such as timeout, interrupted connection or unreachable host) has occurred.',
    userFriendly: 'Network error. Please check your internet connection and try again.',
    category: 'network',
  },
  'auth/internal-error': {
    message: 'An internal error has occurred.',
    userFriendly: 'An unexpected error occurred. Please try again later.',
    category: 'network',
  },

  // Rate limiting
  'auth/too-many-requests': {
    message: 'We have blocked all requests from this device due to unusual activity. Try again later.',
    userFriendly: 'Too many failed attempts. Please wait a few minutes before trying again.',
    category: 'rate-limit',
  },

  // Operation errors
  'auth/operation-not-allowed': {
    message: 'The given sign-in provider is disabled for this Firebase project.',
    userFriendly: 'Email/password authentication is not enabled. Please contact support.',
    category: 'account',
  },
  'auth/operation-not-allowed-in-context': {
    message: 'This operation is not allowed in the current authentication context.',
    userFriendly: 'This operation is not allowed. Please try again.',
    category: 'account',
  },
  'auth/popup-closed-by-user': {
    message: 'The popup has been closed by the user before finalizing the operation.',
    userFriendly: 'Sign-in was cancelled. Please try again.',
    category: 'unknown',
  },

  // Token errors
  'auth/invalid-verification-code': {
    message: 'The verification code is invalid.',
    userFriendly: 'Invalid verification code. Please check and try again.',
    category: 'account',
  },
  'auth/invalid-verification-id': {
    message: 'The verification ID used to create the phone auth credential is invalid.',
    userFriendly: 'Invalid verification. Please request a new code.',
    category: 'account',
  },
  'auth/code-expired': {
    message: 'The verification code has expired.',
    userFriendly: 'Verification code has expired. Please request a new one.',
    category: 'account',
  },

  // Email verification
  'auth/unverified-email': {
    message: 'Email is not verified.',
    userFriendly: 'Please verify your email address before signing in.',
    category: 'email',
  },

  // Quota exceeded
  'auth/quota-exceeded': {
    message: 'The project\'s quota for this operation has been exceeded.',
    userFriendly: 'Service temporarily unavailable. Please try again later.',
    category: 'rate-limit',
  },
};

/**
 * Handle Firebase Auth errors and return user-friendly messages
 */
export function handleAuthError(error: any): AuthError {
  // If it's already a formatted AuthError, return it
  if (error.code && error.userFriendly) {
    return error as AuthError;
  }

  // Extract error code
  const errorCode = error?.code || error?.error?.code || 'auth/unknown-error';
  
  // Check if we have a mapping for this error
  const mappedError = AUTH_ERROR_MAP[errorCode];
  
  if (mappedError) {
    return {
      code: errorCode,
      ...mappedError,
    };
  }

  // Handle generic errors
  const errorMessage = error?.message || error?.toString() || 'An unknown error occurred';
  
  // Try to extract meaningful message
  if (errorMessage.includes('email')) {
    return {
      code: 'auth/unknown-email-error',
      message: errorMessage,
      userFriendly: 'There was an issue with your email. Please check and try again.',
      category: 'email',
    };
  }

  if (errorMessage.includes('password')) {
    return {
      code: 'auth/unknown-password-error',
      message: errorMessage,
      userFriendly: 'There was an issue with your password. Please check and try again.',
      category: 'password',
    };
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      code: 'auth/network-error',
      message: errorMessage,
      userFriendly: 'Network error. Please check your connection and try again.',
      category: 'network',
    };
  }

  // Default unknown error
  return {
    code: 'auth/unknown-error',
    message: errorMessage,
    userFriendly: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    category: 'unknown',
  };
}

/**
 * Handle Firestore errors
 */
export function handleFirestoreError(error: any): string {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || 'Database error occurred';

  switch (errorCode) {
    case 'permission-denied':
      return 'Permission denied. You may not have access to perform this action.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again later.';
    case 'unauthenticated':
      return 'Please sign in to continue.';
    case 'not-found':
      return 'The requested data was not found.';
    case 'already-exists':
      return 'This item already exists.';
    case 'resource-exhausted':
      return 'Too many requests. Please wait a moment and try again.';
    case 'failed-precondition':
      return 'Action cannot be completed. Please check your input.';
    case 'aborted':
      return 'Operation was cancelled. Please try again.';
    case 'out-of-range':
      return 'Invalid input provided.';
    case 'unimplemented':
      return 'This feature is not yet available.';
    case 'internal':
      return 'An internal error occurred. Please try again later.';
    default:
      return errorMessage || 'A database error occurred. Please try again.';
  }
}

/**
 * Handle OTP-specific errors
 */
export function handleOTPError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'OTP verification failed';

  if (errorMessage.includes('expired')) {
    return 'Verification code has expired. Please request a new one.';
  }

  if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
    return 'Invalid verification code. Please check and try again.';
  }

  if (errorMessage.includes('attempts')) {
    return 'Too many failed attempts. Please request a new verification code.';
  }

  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return 'Verification code not found. Please request a new one.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  return errorMessage;
}

/**
 * Handle general API errors
 */
export function handleAPIError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  const statusCode = error?.status || error?.statusCode || error?.response?.status;
  const errorMessage = error?.message || error?.error || error?.toString();

  switch (statusCode) {
    case 400:
      return errorMessage || 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please sign in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return errorMessage || 'An error occurred. Please try again.';
  }
}

/**
 * Get error icon based on error category
 */
export function getErrorIcon(category: AuthError['category']): string {
  switch (category) {
    case 'email':
      return '📧';
    case 'password':
      return '🔒';
    case 'network':
      return '🌐';
    case 'account':
      return '👤';
    case 'rate-limit':
      return '⏱️';
    default:
      return '⚠️';
  }
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: AuthError | string): boolean {
  if (typeof error === 'string') {
    return !error.includes('disabled') && !error.includes('not allowed');
  }

  const nonRecoverableCodes = [
    'auth/user-disabled',
    'auth/operation-not-allowed',
    'auth/email-already-in-use',
  ];

  return !nonRecoverableCodes.includes(error.code);
}


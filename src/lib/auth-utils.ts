/**
 * Authentication utility functions
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate .edu email domain
 */
export function validateEduEmail(email: string, allowedDomains: string[]): {
  isValid: boolean;
  error: string;
} {
  if (!email || !email.includes('@')) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  const domain = email.split('@')[1]?.toLowerCase();

  if (!domain) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  // Check if domain ends with .edu or matches allowed domains
  const isValidDomain = allowedDomains.some((allowedDomain) => {
    if (allowedDomain.startsWith('.')) {
      // If allowed domain starts with ., check if email domain ends with it
      return domain.endsWith(allowedDomain.toLowerCase());
    }
    // Exact match
    return domain === allowedDomain.toLowerCase();
  });

  if (!isValidDomain) {
    return {
      isValid: false,
      error: `Only ${allowedDomains.join(', ')} email addresses are allowed`,
    };
  }

  return {
    isValid: true,
    error: '',
  };
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): {
  match: boolean;
  error: string;
} {
  if (password !== confirmPassword) {
    return {
      match: false,
      error: 'Passwords do not match',
    };
  }

  return {
    match: true,
    error: '',
  };
}


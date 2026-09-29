export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push('Minimum 8 characters');
  if (!hasNumber) errors.push('At least one number');
  if (!hasUppercase) errors.push('At least one uppercase letter');

  return {
    isValid: hasMinLength && hasNumber && hasUppercase,
    hasMinLength,
    hasNumber,
    hasUppercase,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validateTransactionInput(data: {
  title: string;
  amount: number | string;
  category: string;
  date: string;
}): { isValid: boolean; error?: string } {
  if (!data.title || data.title.trim().length === 0) {
    return { isValid: false, error: 'Please enter a transaction title.' };
  }

  const numericAmount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount greater than zero.' };
  }

  if (!data.category || data.category.trim().length === 0) {
    return { isValid: false, error: 'Please select a category.' };
  }

  if (!data.date) {
    return { isValid: false, error: 'Please select a transaction date.' };
  }

  return { isValid: true };
}

/**
 * Converts technical Firebase Auth & Firestore errors into friendly user messages.
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error.code || (typeof error.message === 'string' ? error.message : '');

  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please meet all password requirements.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in window was closed before completion.';
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    default:
      if (typeof error.message === 'string' && error.message.length > 0 && !error.message.includes('auth/')) {
        return error.message;
      }
      return 'Something went wrong. Please check your details and try again.';
  }
}

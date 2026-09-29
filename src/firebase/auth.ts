import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { UserProfile } from '../types';
import { createUserProfile, getUserProfile } from './firestore';

const LOCAL_STORAGE_USER_KEY = 'spendly_auth_user';
const LOCAL_STORAGE_USERS_DB_KEY = 'spendly_local_users';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  fullName: string
): Promise<AuthUser> {
  if (isFirebaseConfigured() && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (fullName && cred.user) {
      await updateProfile(cred.user, { displayName: fullName });
    }
    // Create Firestore user record
    await createUserProfile({
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: fullName || 'User',
      currency: 'NGN',
      themePreference: 'dark',
      budgetAlerts: true,
      monthlySummaries: true,
      createdAt: new Date().toISOString(),
    });
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: fullName,
    };
  }

  // Local Storage Mock Fallback
  const usersJson = localStorage.getItem(LOCAL_STORAGE_USERS_DB_KEY);
  const users = usersJson ? JSON.parse(usersJson) : [];
  const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const error: any = new Error('An account with this email already exists.');
    error.code = 'auth/email-already-in-use';
    throw error;
  }

  const newUid = 'usr_' + Math.random().toString(36).substring(2, 11);
  const newUser = {
    uid: newUid,
    email,
    password: pass, // In mock mode only
    displayName: fullName,
    currency: 'NGN',
    themePreference: 'dark',
    budgetAlerts: true,
    monthlySummaries: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(LOCAL_STORAGE_USERS_DB_KEY, JSON.stringify(users));

  const authUser: AuthUser = {
    uid: newUid,
    email,
    displayName: fullName,
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
  return authUser;
}

export async function loginWithEmail(email: string, pass: string): Promise<AuthUser> {
  if (isFirebaseConfigured() && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
    };
  }

  // Local Storage Fallback
  const usersJson = localStorage.getItem(LOCAL_STORAGE_USERS_DB_KEY);
  const users = usersJson ? JSON.parse(usersJson) : [];
  const user = users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
  );

  // If no user found and email is a demo login or newly typed demo, allow instant test if matching demo credentials
  if (!user) {
    if (email.toLowerCase() === 'demo@spendly.com' && pass === 'Spendly2026!') {
      const demoUid = 'demo_user_spendly_id';
      const demoAuthUser = {
        uid: demoUid,
        email: 'demo@spendly.com',
        displayName: 'Demo User',
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoAuthUser));
      return demoAuthUser;
    }
    const error: any = new Error('Incorrect email or password.');
    error.code = 'auth/invalid-login-credentials';
    throw error;
  }

  const authUser: AuthUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
  return authUser;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured() && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export async function resetUserPassword(email: string): Promise<void> {
  if (isFirebaseConfigured() && auth) {
    await sendPasswordResetEmail(auth, email);
    return;
  }
  // In local mode, simulate a successful password reset dispatch
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  if (isFirebaseConfigured() && auth) {
    return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
        });
      } else {
        callback(null);
      }
    });
  }

  // Check local session
  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) {
    try {
      callback(JSON.parse(stored));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }

  const storageHandler = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_USER_KEY) {
      if (e.newValue) {
        callback(JSON.parse(e.newValue));
      } else {
        callback(null);
      }
    }
  };
  window.addEventListener('storage', storageHandler);
  return () => window.removeEventListener('storage', storageHandler);
}

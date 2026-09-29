import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AuthUser,
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetUserPassword,
  subscribeToAuth,
} from '../firebase/auth';
import {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
} from '../firebase/firestore';
import { isFirebaseConfigured } from '../firebase/config';
import { UserProfile, CurrencyCode } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isFirebase: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateCurrency: (currency: CurrencyCode) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebase = isFirebaseConfigured();

  const loadProfile = useCallback(async (authUser: AuthUser) => {
    try {
      let p = await getUserProfile(authUser.uid);
      if (!p) {
        // Initialize default profile
        p = {
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'Spendly User',
          currency: 'NGN',
          themePreference: 'dark',
          budgetAlerts: true,
          monthlySummaries: true,
          createdAt: new Date().toISOString(),
        };
        await createUserProfile(p);
      }
      setProfile(p);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback in-memory profile
      setProfile({
        uid: authUser.uid,
        email: authUser.email || '',
        displayName: authUser.displayName || 'Spendly User',
        currency: 'NGN',
        themePreference: 'dark',
        budgetAlerts: true,
        monthlySummaries: true,
        createdAt: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await loadProfile(authUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, pass: string) => {
    const authUser = await loginWithEmail(email, pass);
    setUser(authUser);
    await loadProfile(authUser);
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    const authUser = await registerWithEmail(email, pass, fullName);
    setUser(authUser);
    await loadProfile(authUser);
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const sendPasswordReset = async (email: string) => {
    await resetUserPassword(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, updates);
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    if (updates.displayName) {
      setUser((prev) => (prev ? { ...prev, displayName: updates.displayName! } : null));
    }
  };

  const updateCurrency = async (currency: CurrencyCode) => {
    await updateProfile({ currency });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isFirebase,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
        updateProfile,
        updateCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

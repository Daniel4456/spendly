import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Transaction, Budget, UserProfile } from '../types';

const LOCAL_PROFILES_KEY = 'spendly_profiles';
const LOCAL_TRANSACTIONS_KEY = 'spendly_transactions';
const LOCAL_BUDGETS_KEY = 'spendly_budgets';

// USER PROFILES
export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (isFirebaseConfigured() && db) {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
    return;
  }
  const profiles = JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  profiles[profile.uid] = profile;
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured() && db) {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  }
  const profiles = JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  return profiles[uid] || null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
    return;
  }
  const profiles = JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  if (profiles[uid]) {
    profiles[uid] = { ...profiles[uid], ...updates };
  } else {
    profiles[uid] = updates;
  }
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
}

// TRANSACTIONS
export async function fetchUserTransactions(uid: string): Promise<Transaction[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const txRef = collection(db, 'users', uid, 'transactions');
      const q = query(txRef, orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const list: Transaction[] = [];
      snap.forEach((docItem) => {
        list.push({ id: docItem.id, ...(docItem.data() as Omit<Transaction, 'id'>) });
      });
      return list;
    } catch {
      // In case indexing is still building or collection query fallback
      const txRef = collection(db, 'users', uid, 'transactions');
      const snap = await getDocs(txRef);
      const list: Transaction[] = [];
      snap.forEach((docItem) => {
        list.push({ id: docItem.id, ...(docItem.data() as Omit<Transaction, 'id'>) });
      });
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  // Local storage
  const allTx: Transaction[] = JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
  return allTx
    .filter((t) => t.userId === uid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addUserTransaction(
  data: Omit<Transaction, 'id'>
): Promise<Transaction> {
  if (isFirebaseConfigured() && db) {
    const txRef = collection(db, 'users', data.userId, 'transactions');
    const docRef = await addDoc(txRef, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return {
      id: docRef.id,
      ...data,
    };
  }

  // Local storage
  const allTx: Transaction[] = JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
  const newTx: Transaction = {
    ...data,
    id: 'tx_' + Math.random().toString(36).substring(2, 11),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allTx.push(newTx);
  localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(allTx));
  return newTx;
}

export async function updateUserTransaction(
  transactionId: string,
  userId: string,
  updates: Partial<Transaction>
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const allTx: Transaction[] = JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
  const idx = allTx.findIndex((t) => t.id === transactionId && t.userId === userId);
  if (idx !== -1) {
    allTx[idx] = {
      ...allTx[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(allTx));
  }
}

export async function deleteUserTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
    return;
  }

  const allTx: Transaction[] = JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
  const filtered = allTx.filter((t) => !(t.id === transactionId && t.userId === userId));
  localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(filtered));
}

// BUDGETS
export async function fetchUserBudgets(uid: string): Promise<Budget[]> {
  if (isFirebaseConfigured() && db) {
    const bRef = collection(db, 'users', uid, 'budgets');
    const snap = await getDocs(bRef);
    const list: Budget[] = [];
    snap.forEach((docItem) => {
      list.push({ id: docItem.id, ...(docItem.data() as Omit<Budget, 'id'>) });
    });
    return list;
  }

  const allBudgets: Budget[] = JSON.parse(localStorage.getItem(LOCAL_BUDGETS_KEY) || '[]');
  return allBudgets.filter((b) => b.userId === uid);
}

export async function saveUserBudget(
  userId: string,
  category: string,
  monthlyLimit: number,
  budgetId?: string
): Promise<Budget> {
  if (isFirebaseConfigured() && db) {
    if (budgetId) {
      const docRef = doc(db, 'users', userId, 'budgets', budgetId);
      await updateDoc(docRef, {
        category,
        monthlyLimit,
        updatedAt: new Date().toISOString(),
      });
      return {
        id: budgetId,
        userId,
        category,
        monthlyLimit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const bRef = collection(db, 'users', userId, 'budgets');
      const docRef = await addDoc(bRef, {
        userId,
        category,
        monthlyLimit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        userId,
        category,
        monthlyLimit,
        createdAt: new Date().toISOString(),
      };
    }
  }

  const allBudgets: Budget[] = JSON.parse(localStorage.getItem(LOCAL_BUDGETS_KEY) || '[]');
  if (budgetId) {
    const idx = allBudgets.findIndex((b) => b.id === budgetId && b.userId === userId);
    if (idx !== -1) {
      allBudgets[idx] = {
        ...allBudgets[idx],
        category,
        monthlyLimit,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(allBudgets));
      return allBudgets[idx];
    }
  }

  // Check if budget for category already exists
  const existingIdx = allBudgets.findIndex((b) => b.userId === userId && b.category === category);
  if (existingIdx !== -1) {
    allBudgets[existingIdx].monthlyLimit = monthlyLimit;
    allBudgets[existingIdx].updatedAt = new Date().toISOString();
    localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(allBudgets));
    return allBudgets[existingIdx];
  }

  const newBudget: Budget = {
    id: 'bg_' + Math.random().toString(36).substring(2, 11),
    userId,
    category,
    monthlyLimit,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allBudgets.push(newBudget);
  localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(allBudgets));
  return newBudget;
}

export async function deleteUserBudget(budgetId: string, userId: string): Promise<void> {
  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'users', userId, 'budgets', budgetId);
    await deleteDoc(docRef);
    return;
  }

  const allBudgets: Budget[] = JSON.parse(localStorage.getItem(LOCAL_BUDGETS_KEY) || '[]');
  const filtered = allBudgets.filter((b) => !(b.id === budgetId && b.userId === userId));
  localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(filtered));
}

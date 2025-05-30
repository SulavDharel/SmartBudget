import { writable } from 'svelte/store';
import { derived } from 'svelte/store';
import { transactionsStore } from './transactions';
import { auth, db } from '$lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { DashboardStats } from '$lib/types';



// Create a separate store for user balance
const userBalance = writable<number>(0);

// Track balance changes from Firestore
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userDoc = doc(db, 'users', user.uid);
    return onSnapshot(userDoc, (snap) => {
      const balance = snap.data()?.balance || 0;
      userBalance.set(balance);
    });
  }
  userBalance.set(0);
});

// Create derived dashboard stats
export const dashboardStats = derived(
  [transactionsStore, userBalance],
  ([$transactions, $balance]): DashboardStats => {
    const income = $transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenditure = $transactions
      .filter(t => t.type === 'expenditure')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenditure;

    return {
      balance: $balance,
      income,
      savings
    };
  }
);
// src/routes/dashboard/+layout.ts
import type { LayoutLoad } from './$types';
import { db } from '$lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async () => {
  // Only run on the browser
  if (typeof localStorage === 'undefined') return;

  const stored = localStorage.getItem('user');
  if (!stored) throw redirect(303, '/login');

  const user = JSON.parse(stored);
  if (!user?.uid) throw redirect(303, '/login');

  // Fetch stats
  const statsSnap = await getDoc(doc(db, 'users', user.uid, 'stats', 'overview'));
  const stats = statsSnap.data() ?? { balance: 0, income: 0, savings: 0 };

  // Fetch transactions
  const txSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
  const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  return {
    transactions,
    stats
  };
};

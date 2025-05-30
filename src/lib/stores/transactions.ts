import { writable } from 'svelte/store';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp
} from "firebase/firestore";
import { db, auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Transaction } from '../types';


function createTransactionsStore() {
    const { subscribe, set } = writable<Transaction[]>([]);
    let unsubscribe: (() => void) | null = null;
    const loaded = writable(false);

    // Automatically initialize on auth state changes
    onAuthStateChanged(auth, (user) => {
        // Cleanup previous listener
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
            loaded.set(false);
            set([]);
        }

        if (user) {
            const uid = user.uid;
            const txCol = collection(db, 'users', uid, 'transactions');
            const q = query(txCol, orderBy('date', 'desc'));

            unsubscribe = onSnapshot(
                q,
                (snap) => {
                    const txs: Transaction[] = [];
                    snap.forEach((doc) => {
                        const data = doc.data() as any;
                        txs.push({
                            id: doc.id,
                            date: data.date instanceof Timestamp
                                ? data.date.toDate().toISOString().slice(0, 10)
                                : data.date,
                            description: data.description,
                            amount: data.amount,
                            category: data.category,
                            type: data.type
                        });
                    });
                    set(txs);
                    loaded.set(true); // Data loaded
                },
                (err) => {
                    console.error('Error fetching transactions:', err);
                    loaded.set(true);
                }
            );
        }else{
            loaded.set(true);
        }
    });

    return {
        subscribe,
        loaded: { subscribe: loaded.subscribe },
        /** Add a transaction under the current user */
        async add(tx: Omit<Transaction, 'id'>) {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            const txData = {
                ...tx,
                createdAt: Timestamp.now()
            };

            await addDoc(
                collection(db, 'users', user.uid, 'transactions'),
                txData
            );
            // onSnapshot listener updates store automatically
        },

        /** Clear local store */
        clear() {
            set([]);
        },

        /** Tear down listener manually */
        destroy() {
            if (unsubscribe) {
                unsubscribe();
                unsubscribe = null;
            }
        }
    };
}

export const transactionsStore = createTransactionsStore();

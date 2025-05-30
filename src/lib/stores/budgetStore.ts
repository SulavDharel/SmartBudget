import { writable, derived } from 'svelte/store';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    where,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Budget } from "$lib/types";
import { transactionsStore } from '$lib/stores/transactions';

interface FirestoreBudget extends Omit<Budget, 'startDate' | 'endDate' | 'id'> {
    startDate: Timestamp;
    endDate: Timestamp;
}

function createBudgetStore() {
    const { subscribe, set, update } = writable<Budget[]>([]);
    let unsubscribe: (() => void) | null = null;
    const loaded = writable(false);

    onAuthStateChanged(auth, (user) => {
        if (unsubscribe) unsubscribe();
        if (!user) {
            set([]);
            loaded.set(true);
            return;
        }

        const budgetsCol = collection(db, 'users', user.uid, 'budgets');
        const q = query(budgetsCol, orderBy('startDate', 'desc'));

        unsubscribe = onSnapshot(q, (snapshot) => {
            const budgets = snapshot.docs.map(doc => {
                const data = doc.data() as FirestoreBudget;
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate.toDate().toISOString().split('T')[0],
                    endDate: data.endDate.toDate().toISOString().split('T')[0]
                };
            });
            set(budgets);
            loaded.set(true);
        });
    });

    return {
        subscribe,
        loaded: { subscribe: loaded.subscribe },
        async add(budget: Omit<Budget, 'id'>) {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            await addDoc(collection(db, 'users', user.uid, 'budgets'), {
                ...budget,
                startDate: Timestamp.fromDate(new Date(budget.startDate)),
                endDate: Timestamp.fromDate(new Date(budget.endDate))
            });
        },
        async update(id: string, budget: Partial<Budget>) {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            await updateDoc(doc(db, 'users', user.uid, 'budgets', id), {
                ...budget,
                ...(budget.startDate && { startDate: Timestamp.fromDate(new Date(budget.startDate)) }),
                ...(budget.endDate && { endDate: Timestamp.fromDate(new Date(budget.endDate)) })
            });
        },
        async remove(id: string) {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
        }
    };
}

export const budgetStore = createBudgetStore();


export const chartData = derived(
    [budgetStore, transactionsStore],
    ([$budgets, $transactions]) => {
        const now = new Date();
        const months: string[] = [];
        const spendingData: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
            const total = $transactions
                .filter(tx => {
                    const t = new Date(tx.date);
                    return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
                })
                .reduce((sum, tx) => sum + tx.amount, 0);

            spendingData.push(total);
        }

        return { months, spendingData };
    }
);
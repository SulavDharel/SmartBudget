import { writable } from 'svelte/store';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db, auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Reminder } from '$lib/types';


function createRemindersStore() {
  const aiReminder: Reminder = {
    id: 'ai-assistant',
    title: 'AI Assistant',
    subtitle: 'Click here for saving tips',
    highlight: false,
    isAI: true,
    icon: 'assistant',
  };

  const { subscribe, set, update } = writable<Reminder[]>([aiReminder]);
  let unsubscribe: (() => void) | null = null;
  const loaded = writable(false);

  // Automatically initialize on auth state changes
  onAuthStateChanged(auth, (user) => {
    // Cleanup any previous listener
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      set([aiReminder]);
      loaded.set(false);
    }

    if (user) {
      const uid = user.uid;
      const remCol = collection(db, 'users', uid, 'reminders');
      const q = query(remCol, orderBy('dueDate', 'asc'));

      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const items: Reminder[] = [aiReminder]; 8
          snap.forEach((doc) => {
            const data = doc.data() as any;
            items.push({
              id: doc.id,
              title: data.title,
              subtitle: data.subtitle,
              highlight: data.highlight || false,
              isAI: false,
              amount: data.amount,
              description: data.description,
              category: data.category,
              dueDate: data.dueDate instanceof Timestamp
                ? data.dueDate.toDate().toISOString().slice(0, 10)
                : data.dueDate,
              icon: data.icon || 'default',
              type: data.type || 'expenditure'
            });
          });
          set(items);
          loaded.set(true);
        },
        (err) => {
          console.error('Error fetching reminders:', err);
          loaded.set(true); // Consider loaded even if error
        }

      );
    } else {
      loaded.set(true); // No user, data is loaded (only AI)
    }
  });

  return {
    subscribe,
    loaded: { subscribe: loaded.subscribe },
    /** Add a reminder under the current user */
    async add(rem: Omit<Reminder, 'id'>) {
      if (rem.isAI) {
        update(rs => [...rs, { ...rem, id: Date.now().toString() }]);
        return;
      }
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const data = {
        title: rem.title,
        subtitle: rem.subtitle,
        highlight: rem.highlight || false,
        amount: rem.amount,
        description: rem.description,
        category: rem.category,
        dueDate: rem.dueDate,
        icon: rem.icon || 'default',
        type: rem.type || 'expenditure',
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, 'users', user.uid, 'reminders'), data);
    },

    /** Remove a reminder */
    async remove(id: string) {
      // Prevent AI reminder deletion
      if (id === aiReminder.id) return;
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
    },

    /** Clear all reminders except the AI assistant */
    clear() {
      set([aiReminder]);
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

export const remindersStore = createRemindersStore();

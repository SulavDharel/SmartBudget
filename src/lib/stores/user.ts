// src/lib/stores/user.ts
import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { browser } from '$app/environment';

export const USER = writable<User | null>(null);

if (browser) {
  onAuthStateChanged(auth, (u) => {
    USER.set(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify({ uid: u.uid, email: u.email }));
    } else {
      localStorage.removeItem("user");
    }
  });
}

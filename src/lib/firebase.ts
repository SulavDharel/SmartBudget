import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeYndJKvQMQGb6FR6QsQk2a6HSxIa4KXE",
  authDomain: "pft-smartbudget.firebaseapp.com",
  projectId: "pft-smartbudget",
  storageBucket: "pft-smartbudget.firebasestorage.app",
  messagingSenderId: "326618578387",
  appId: "1:326618578387:web:724087e6371562901fc326",
  measurementId: "G-PXWS6CM60W"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
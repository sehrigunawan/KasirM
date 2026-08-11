import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's Firebase Configuration (Project: kasirm-ca02b)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9NoMHibHhLo__W9AUTgyhbKPgN5cxGhY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kasirm-ca02b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kasirm-ca02b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kasirm-ca02b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "89408534827",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:89408534827:web:afe0553f3a9897b40fad6e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4VR3FMSK17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Initialize Analytics if supported
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  }).catch(() => {});
}

export default app;

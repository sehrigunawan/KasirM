import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration from Vite Environment Variables or Fallback Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKasirPintarKey123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kasirpintar-wa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kasirpintar-wa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kasirpintar-wa.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);
export default app;

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBi3NgIhimFDPpJFv3ADcKf14wWH9Rzh-E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'geor-b376a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'geor-b376a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'geor-b376a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '821882183313',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:821882183313:web:fb81d51b3dc53bb7516930',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BH5RQXM0NN'
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics initialization
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'demo_api_key'
);

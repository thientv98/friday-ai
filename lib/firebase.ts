import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validate config
  if (!config.apiKey || !config.projectId) {
    throw new Error('Firebase configuration is missing. Please check your environment variables.');
  }

  return config;
}

// Initialize Firebase only on client-side
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getApp(): FirebaseApp {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client-side');
  }

  if (!app) {
    if (getApps().length === 0) {
      const firebaseConfig = getFirebaseConfig();
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

// Lazy getter for auth - only initialize when accessed on client-side
export function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used on the client-side');
  }
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
}

// Lazy getter for db - only initialize when accessed on client-side
export function getDbInstance(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore can only be used on the client-side');
  }
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
  }
  return dbInstance;
}

// Don't export auth and db directly to avoid SSR issues
// Use getAuthInstance() and getDbInstance() instead

export default getApp;


import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { getAuthInstance as getAuth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

// Use getAuthInstance directly

export const signInWithGoogle = async (): Promise<User> => {
  if (typeof window === 'undefined') {
    throw new Error('signInWithGoogle can only be called on the client-side');
  }
  try {
    const result = await signInWithPopup(getAuth(), googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('signOut can only be called on the client-side');
  }
  try {
    await firebaseSignOut(getAuth());
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (typeof window === 'undefined') {
    // Return a no-op unsubscribe function during SSR
    return () => {};
  }
  return onAuthStateChanged(getAuth(), callback);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return getAuth().currentUser;
};


import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { Expense, Category } from '@/types';

// Collections paths
const getExpensesCollection = (userId: string) => `users/${userId}/expenses`;
const getCategoriesCollection = (userId: string) => `users/${userId}/categories`;
const getUserDoc = (userId: string) => {
  if (typeof window === 'undefined') {
    throw new Error('getUserDoc can only be called on the client-side');
  }
  return doc(getDbInstance(), 'users', userId);
};

// ========== EXPENSES ==========

/**
 * Lưu một expense mới hoặc cập nhật expense hiện có
 */
export const saveExpense = async (userId: string, expense: Expense): Promise<void> => {
  try {
    const expenseRef = doc(getDbInstance(), getExpensesCollection(userId), expense.id);
    await setDoc(expenseRef, {
      ...expense,
      createdAt: Timestamp.fromMillis(expense.createdAt),
    });
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

/**
 * Lưu nhiều expenses cùng lúc
 */
export const saveExpenses = async (userId: string, expenses: Expense[]): Promise<void> => {
  try {
    const promises = expenses.map(expense => {
      const expenseRef = doc(getDbInstance(), getExpensesCollection(userId), expense.id);
      return setDoc(expenseRef, {
        ...expense,
        createdAt: Timestamp.fromMillis(expense.createdAt),
      });
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw error;
  }
};

/**
 * Xóa một expense
 */
export const deleteExpense = async (userId: string, expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(getDbInstance(), getExpensesCollection(userId), expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Cập nhật một expense
 */
export const updateExpense = async (userId: string, expense: Expense): Promise<void> => {
  try {
    const expenseRef = doc(getDbInstance(), getExpensesCollection(userId), expense.id);
    await updateDoc(expenseRef, {
      ...expense,
      createdAt: Timestamp.fromMillis(expense.createdAt),
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Load tất cả expenses của user (one-time)
 * Note: Nên sử dụng subscribeToExpenses để có real-time updates
 */
export const loadExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const expensesRef = collection(getDbInstance(), getExpensesCollection(userId));
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
      } as Expense;
    });
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

/**
 * Subscribe để lắng nghe thay đổi expenses (real-time)
 */
export const subscribeToExpenses = (
  userId: string,
  callback: (expenses: Expense[]) => void
): (() => void) => {
  try {
    const expensesRef = collection(getDbInstance(), getExpensesCollection(userId));
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const expenses: Expense[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        } as Expense;
      });
      callback(expenses);
    }, (error) => {
      console.error('Error in expenses subscription:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up expenses subscription:', error);
    return () => {};
  }
};

// ========== CATEGORIES ==========

/**
 * Lưu categories của user
 */
export const saveCategories = async (userId: string, categories: Category[]): Promise<void> => {
  try {
    const userDocRef = getUserDoc(userId);
    await setDoc(userDocRef, { categories }, { merge: true });
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};

/**
 * Thêm một category mới
 */
export const addCategory = async (userId: string, category: Category): Promise<void> => {
  try {
    const userDocRef = getUserDoc(userId);
    const userDoc = await getDoc(userDocRef);
    
    const currentCategories = userDoc.exists() 
      ? (userDoc.data().categories || [])
      : [];
    
    const updatedCategories = [...currentCategories, category];
    await setDoc(userDocRef, { categories: updatedCategories }, { merge: true });
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Load categories của user
 */
export const loadCategories = async (userId: string): Promise<Category[]> => {
  try {
    const userDocRef = getUserDoc(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    return userData?.categories || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

/**
 * Subscribe để lắng nghe thay đổi categories (real-time)
 */
export const subscribeToCategories = (
  userId: string,
  callback: (categories: Category[]) => void
): (() => void) => {
  try {
    const userDocRef = getUserDoc(userId);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        callback(userData?.categories || []);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error in categories subscription:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up categories subscription:', error);
    return () => {};
  }
};


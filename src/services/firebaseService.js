import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/initialData';

// Firestore Collection References
const PRODUCTS_COL = collection(db, 'products');
const TRANSACTIONS_COL = collection(db, 'transactions');
const PENDING_ORDERS_COL = collection(db, 'pending_orders');
const SETTINGS_DOC = doc(db, 'settings', 'storeSettings');

/**
 * Real-time listener for Products collection
 */
export const subscribeProducts = (onUpdate, onError) => {
  return onSnapshot(PRODUCTS_COL, async (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // If Cloud Database is completely empty, seed initial data to Cloud
    if (products.length === 0) {
      console.log("Seeding initial products to Firebase Firestore Cloud...");
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    } else {
      onUpdate(products);
    }
  }, (err) => {
    console.warn("Firestore listener warning (using cloud sync):", err);
    if (onError) onError(err);
  });
};

/**
 * Real-time listener for Transactions collection
 */
export const subscribeTransactions = (onUpdate) => {
  const q = query(TRANSACTIONS_COL, orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(transactions);
  }, (err) => {
    console.warn("Transactions Firestore listener warning:", err);
  });
};

/**
 * Real-time listener for Pending WhatsApp Orders collection
 */
export const subscribePendingOrders = (onUpdate) => {
  const q = query(PENDING_ORDERS_COL, orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(orders);
  }, (err) => {
    console.warn("Pending Orders Firestore listener warning:", err);
  });
};

/**
 * Real-time listener for Store Settings document
 */
export const subscribeSettings = (onUpdate) => {
  return onSnapshot(SETTINGS_DOC, async (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data());
    } else {
      // Seed default settings if not created yet
      await setDoc(SETTINGS_DOC, DEFAULT_STORE_SETTINGS);
      onUpdate(DEFAULT_STORE_SETTINGS);
    }
  }, (err) => {
    console.warn("Settings Firestore listener warning:", err);
  });
};

/**
 * Cloud Operations: Add/Update Product
 */
export const saveProductToCloud = async (product) => {
  const prodRef = doc(db, 'products', product.id);
  await setDoc(prodRef, product, { merge: true });
};

/**
 * Cloud Operations: Delete Product
 */
export const deleteProductFromCloud = async (productId) => {
  const prodRef = doc(db, 'products', productId);
  await deleteDoc(prodRef);
};

/**
 * Cloud Operations: Save New Transaction
 */
export const addTransactionToCloud = async (transaction) => {
  const transRef = doc(db, 'transactions', transaction.id);
  await setDoc(transRef, transaction);
};

/**
 * Cloud Operations: Add New Pending Order from Buyer
 */
export const addPendingOrderToCloud = async (pendingOrder) => {
  const orderRef = doc(db, 'pending_orders', pendingOrder.id);
  await setDoc(orderRef, pendingOrder);
};

/**
 * Cloud Operations: Remove Pending Order after Confirmation/Rejection
 */
export const removePendingOrderFromCloud = async (orderId) => {
  const orderRef = doc(db, 'pending_orders', orderId);
  await deleteDoc(orderRef);
};

/**
 * Cloud Operations: Save Store Settings
 */
export const saveSettingsToCloud = async (settings) => {
  await setDoc(SETTINGS_DOC, settings, { merge: true });
};

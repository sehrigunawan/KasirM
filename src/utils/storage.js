import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'kasir_pintar_products',
  TRANSACTIONS: 'kasir_pintar_transactions',
  SETTINGS: 'kasir_pintar_settings',
  PENDING_ORDERS: 'kasir_pintar_pending_orders'
};

export const getStoredPendingOrders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading pending orders from storage", e);
    return [];
  }
};

export const savePendingOrders = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Error saving pending orders", e);
  }
};

export const getStoredProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch (e) {
    console.error("Error reading products from storage", e);
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error("Error saving products", e);
  }
};

export const getStoredTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading transactions from storage", e);
    return [];
  }
};

export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error("Error saving transactions", e);
  }
};

export const getStoredSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_STORE_SETTINGS;
  } catch (e) {
    console.error("Error reading settings", e);
    return DEFAULT_STORE_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving settings", e);
  }
};

export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatDate = (dateInput) => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PendingOrdersTab from './components/PendingOrdersTab';
import WAParserTab from './components/WAParserTab';
import PosTab from './components/PosTab';
import InventoryTab from './components/InventoryTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import ReceiptModal from './components/ReceiptModal';
import PrintReceipt from './components/PrintReceipt';
import CustomerOrderModal from './components/CustomerOrderModal';

import {
  subscribeProducts,
  subscribeTransactions,
  subscribePendingOrders,
  subscribeSettings,
  saveProductToCloud,
  deleteProductFromCloud,
  addTransactionToCloud,
  addPendingOrderToCloud,
  removePendingOrderFromCloud,
  saveSettingsToCloud
} from './services/firebaseService';

import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('pending');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);

  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Subscribe to Firebase Cloud Firestore Real-time Listeners
  useEffect(() => {
    const unsubProducts = subscribeProducts((data) => {
      setProducts(data);
      setIsFirebaseConnected(true);
    }, () => setIsFirebaseConnected(false));

    const unsubTransactions = subscribeTransactions((data) => {
      setTransactions(data);
    });

    const unsubPending = subscribePendingOrders((data) => {
      setPendingOrders(data);
    });

    const unsubSettings = subscribeSettings((data) => {
      setStoreSettings(data);
    });

    return () => {
      unsubProducts();
      unsubTransactions();
      unsubPending();
      unsubSettings();
    };
  }, []);

  // Handlers linked directly to Cloud Firestore
  const handleSaveProducts = async (newProducts) => {
    setProducts(newProducts);
    for (const prod of newProducts) {
      await saveProductToCloud(prod);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setStoreSettings(newSettings);
    await saveSettingsToCloud(newSettings);
  };

  const handleResetAllData = async () => {
    for (const prod of INITIAL_PRODUCTS) {
      await saveProductToCloud(prod);
    }
    await saveSettingsToCloud(DEFAULT_STORE_SETTINGS);
  };

  // Buyer Action: Send Order to Cloud Firebase
  const handleAddPendingOrder = async (newOrder) => {
    await addPendingOrderToCloud(newOrder);
  };

  // Seller Action: Confirm Pending WA Order & Print Receipt
  const handleConfirmPendingOrder = async (pendingOrder) => {
    // 1. Deduct Inventory Stock in Firebase Cloud
    for (const item of pendingOrder.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await saveProductToCloud({ ...product, stock: newStock });
      }
    }

    // 2. Save Transaction to Cloud
    const transaction = {
      ...pendingOrder,
      channel: 'WhatsApp'
    };
    await addTransactionToCloud(transaction);

    // 3. Remove from Cloud Pending Orders
    await removePendingOrderFromCloud(pendingOrder.id);

    // 4. Open Thermal Receipt Modal
    setCurrentReceipt(transaction);
  };

  const handleRejectPendingOrder = async (orderId) => {
    await removePendingOrderFromCloud(orderId);
  };

  // Simulate incoming buyer WhatsApp order directly to Cloud
  const handleSimulateNewOrder = async () => {
    const sampleNames = ["Kak Fitri", "Mas Rendy", "Bpk Hariyanto", "Siska (Kantor Melati)"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomProduct1 = products[0] || INITIAL_PRODUCTS[0];
    const randomProduct2 = products[3] || INITIAL_PRODUCTS[3];

    const newSimulatedOrder = {
      id: `WA-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customerName: `${randomName} (Pesanan WA)`,
      customerPhone: `0857-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      address: "Jl. Sudirman No. 88, Jakarta",
      notes: "Mohon diantar cepat ya kak!",
      paymentMethod: "QRIS",
      items: [
        { productId: randomProduct1.id, name: randomProduct1.name, price: randomProduct1.price, qty: 2, subtotal: randomProduct1.price * 2, unit: randomProduct1.unit || 'cup' },
        { productId: randomProduct2.id, name: randomProduct2.name, price: randomProduct2.price, qty: 1, subtotal: randomProduct2.price * 1, unit: randomProduct2.unit || 'porsi' }
      ],
      subtotal: (randomProduct1.price * 2) + (randomProduct2.price * 1),
      shippingFee: 10000,
      discount: 0,
      total: (randomProduct1.price * 2) + (randomProduct2.price * 1) + 10000,
      channel: "WhatsApp",
      status: "pending_review"
    };

    await addPendingOrderToCloud(newSimulatedOrder);
    setActiveTab('pending');
  };

  // Direct POS receipt checkout
  const handleProcessReceipt = async (transaction) => {
    for (const item of transaction.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await saveProductToCloud({ ...product, stock: newStock });
      }
    }

    await addTransactionToCloud(transaction);
    setCurrentReceipt(transaction);
  };

  const handleReprintReceipt = (transaction) => {
    setCurrentReceipt(transaction);
  };

  // Calculate daily metrics
  const todayStr = new Date().toDateString();
  const todayTransactions = transactions.filter(t => new Date(t.date).toDateString() === todayStr);
  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const dailyStats = {
    todayTotal,
    todayCount: todayTransactions.length,
    lowStockCount
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeSettings={storeSettings}
        dailyStats={dailyStats}
        pendingCount={pendingOrders.length}
        onOpenCustomerModal={() => setShowCustomerModal(true)}
      />

      {/* Main Screen Body */}
      <main className="main-content">
        {activeTab === 'pending' && (
          <PendingOrdersTab
            pendingOrders={pendingOrders}
            onConfirmOrder={handleConfirmPendingOrder}
            onRejectOrder={handleRejectPendingOrder}
            onSimulateNewOrder={handleSimulateNewOrder}
            onOpenCustomerOrderModal={() => setShowCustomerModal(true)}
          />
        )}

        {activeTab === 'wa-parser' && (
          <WAParserTab
            products={products}
            onProcessReceipt={handleProcessReceipt}
          />
        )}

        {activeTab === 'pos' && (
          <PosTab
            products={products}
            onProcessReceipt={handleProcessReceipt}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            onSaveProducts={handleSaveProducts}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            transactions={transactions}
            onReprint={handleReprintReceipt}
            onClearHistory={() => {}}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            storeSettings={storeSettings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetAllData}
          />
        )}
      </main>

      {/* Modal Digital Menu Pemesanan Pembeli */}
      {showCustomerModal && (
        <CustomerOrderModal
          products={products}
          storeSettings={storeSettings}
          onClose={() => setShowCustomerModal(false)}
          onSendOrder={handleAddPendingOrder}
        />
      )}

      {/* Modal Interactive Receipt Thermal Preview */}
      {currentReceipt && (
        <ReceiptModal
          transaction={currentReceipt}
          storeSettings={storeSettings}
          onClose={() => setCurrentReceipt(null)}
          onComplete={() => setCurrentReceipt(null)}
        />
      )}

      {/* Hidden printable DOM container for @media print thermal printer */}
      <PrintReceipt
        transaction={currentReceipt}
        storeSettings={storeSettings}
      />
    </div>
  );
}

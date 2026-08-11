import React, { useState } from 'react';
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
  getStoredProducts,
  saveProducts,
  getStoredTransactions,
  saveTransactions,
  getStoredSettings,
  saveSettings,
  getStoredPendingOrders,
  savePendingOrders
} from './utils/storage';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('pending');
  const [products, setProducts] = useState(getStoredProducts);
  const [transactions, setTransactions] = useState(getStoredTransactions);
  const [storeSettings, setStoreSettings] = useState(getStoredSettings);

  // Initial seed pending order for testing if empty
  const [pendingOrders, setPendingOrders] = useState(() => {
    const stored = getStoredPendingOrders();
    if (stored.length === 0) {
      const initialSeed = [
        {
          id: `WA-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          customerName: "Mas Dion (Pembeli WA)",
          customerPhone: "0812-9876-5432",
          address: "Jl. Melati No. 8, Kebayoran",
          notes: "Kopi susu aren nya 1 less ice ya kak",
          paymentMethod: "Transfer BCA / QRIS",
          items: [
            { productId: "PROD-001", name: "Kopi Susu Aren", price: 18000, qty: 2, subtotal: 36000, unit: "cup" },
            { productId: "PROD-004", name: "Roti Bakar Cokelat Keju", price: 20000, qty: 1, subtotal: 20000, unit: "porsi" }
          ],
          subtotal: 56000,
          shippingFee: 10000,
          discount: 0,
          total: 66000,
          channel: "WhatsApp",
          status: "pending_review"
        }
      ];
      savePendingOrders(initialSeed);
      return initialSeed;
    }
    return stored;
  });

  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Storage Sync Helpers
  const updateProducts = (newProducts) => {
    setProducts(newProducts);
    saveProducts(newProducts);
  };

  const updateTransactions = (newTransactions) => {
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };

  const updateSettings = (newSettings) => {
    setStoreSettings(newSettings);
    saveSettings(newSettings);
  };

  const updatePendingOrders = (newOrders) => {
    setPendingOrders(newOrders);
    savePendingOrders(newOrders);
  };

  const handleResetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    saveProducts(INITIAL_PRODUCTS);
    setTransactions([]);
    saveTransactions([]);
    setPendingOrders([]);
    savePendingOrders([]);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    saveSettings(DEFAULT_STORE_SETTINGS);
  };

  // Add new order sent by buyer
  const handleAddPendingOrder = (newOrder) => {
    const updated = [newOrder, ...pendingOrders];
    updatePendingOrders(updated);
  };

  // Seller Action: Confirm Pending WA Order & Print Receipt
  const handleConfirmPendingOrder = (pendingOrder) => {
    // 1. Deduct Inventory Stock
    const updatedProducts = products.map(product => {
      const purchasedItem = pendingOrder.items.find(item => item.productId === product.id);
      if (purchasedItem) {
        const newStock = Math.max(0, product.stock - purchasedItem.qty);
        return { ...product, stock: newStock };
      }
      return product;
    });
    updateProducts(updatedProducts);

    // 2. Save to Transactions History
    const transaction = {
      ...pendingOrder,
      channel: 'WhatsApp'
    };
    updateTransactions([transaction, ...transactions]);

    // 3. Remove from Pending Orders Queue
    const updatedPending = pendingOrders.filter(o => o.id !== pendingOrder.id);
    updatePendingOrders(updatedPending);

    // 4. Open Receipt Modal for Thermal Printing & Copy Text
    setCurrentReceipt(transaction);
  };

  const handleRejectPendingOrder = (orderId) => {
    const updated = pendingOrders.filter(o => o.id !== orderId);
    updatePendingOrders(updated);
  };

  // Simulate incoming buyer WhatsApp order for test
  const handleSimulateNewOrder = () => {
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

    handleAddPendingOrder(newSimulatedOrder);
    setActiveTab('pending');
  };

  // Direct manual receipt checkout
  const handleProcessReceipt = (transaction) => {
    const updatedProducts = products.map(product => {
      const purchasedItem = transaction.items.find(item => item.productId === product.id);
      if (purchasedItem) {
        const newStock = Math.max(0, product.stock - purchasedItem.qty);
        return { ...product, stock: newStock };
      }
      return product;
    });
    updateProducts(updatedProducts);

    updateTransactions([transaction, ...transactions]);
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
            onSaveProducts={updateProducts}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            transactions={transactions}
            onReprint={handleReprintReceipt}
            onClearHistory={() => updateTransactions([])}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            storeSettings={storeSettings}
            onSaveSettings={updateSettings}
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

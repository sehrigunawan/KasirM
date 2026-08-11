import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  User, 
  CheckCircle,
  Tag
} from 'lucide-react';
import { formatRupiah } from '../utils/storage';

export default function PosTab({ products, onProcessReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Pelanggan Offline');
  const [paymentMethod, setPaymentMethod] = useState('Tunai (Cash)');
  const [discount, setDiscount] = useState(0);

  // Extract unique categories
  const categories = ['Semua', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      alert(`Stok ${product.name} telah habis!`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.qty >= product.stock) {
        alert(`Stok ${product.name} hanya tersisa ${product.stock}!`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      updated[existingIndex].subtotal = updated[existingIndex].qty * product.price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          subtotal: product.price,
          stockAvailable: product.stock,
          unit: product.unit || 'pcs'
        }
      ]);
    }
  };

  const handleUpdateQty = (index, delta) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.qty + delta;

    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    if (newQty > item.stockAvailable) {
      alert(`Stok hanya tersisa ${item.stockAvailable}!`);
      return;
    }

    item.qty = newQty;
    item.subtotal = newQty * item.price;
    setCart(updated);
  };

  const handleRemoveItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    const transaction = {
      id: `POS-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customerName: customerName || 'Pelanggan Offline',
      customerPhone: '',
      address: '',
      notes: '',
      paymentMethod: paymentMethod,
      items: cart,
      subtotal: subtotal,
      shippingFee: 0,
      discount: discount,
      total: total,
      channel: 'Kasir Offline'
    };

    onProcessReceipt(transaction);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      {/* Product Catalog Grid (Left 7 Cols) */}
      <div style={{ gridColumn: 'span 7' }}>
        {/* Search & Category Filter */}
        <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari produk atau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            return (
              <div
                key={product.id}
                className="card"
                onClick={() => !isOutOfStock && handleAddToCart(product)}
                style={{
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  height: '100%',
                  padding: '1rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginBottom: '0.25rem' }}>
                    {product.sku} • {product.category}
                  </div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
                    {product.name}
                  </h4>
                </div>

                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-700)', marginBottom: '0.5rem' }}>
                    {formatRupiah(product.price)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${isOutOfStock ? 'badge-danger' : product.stock <= product.minStock ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                      Stok: {product.stock} {product.unit}
                    </span>
                    <button className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem' }} disabled={isOutOfStock}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POS Cart Sidebar (Right 5 Cols) */}
      <div style={{ gridColumn: 'span 5' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.875rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                Keranjang Kasir ({cart.reduce((s, i) => s + i.qty, 0)})
              </h3>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="btn btn-secondary btn-sm" style={{ fontSize: '0.725rem' }}>
                Kosongkan
              </button>
            )}
          </div>

          {/* Customer & Payment options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Pembeli:</label>
              <input
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Metode Pembayaran:</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
              >
                <option value="Tunai (Cash)">Tunai (Cash)</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer BCA">Transfer BCA</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Debit Card">Kartu Debit</option>
              </select>
            </div>
          </div>

          {/* Cart Item List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-slate-400)', fontSize: '0.875rem' }}>
                Klik produk di katalog kiri untuk memasukkan ke keranjang
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-slate-900)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>@{formatRupiah(item.price)}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button onClick={() => handleUpdateQty(idx, -1)} style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#fff', border: '1px solid #ccc', fontWeight: 700 }}>-</button>
                      <span style={{ padding: '0 0.375rem', fontWeight: 700, fontSize: '0.8125rem' }}>{item.qty}</span>
                      <button onClick={() => handleUpdateQty(idx, 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#fff', border: '1px solid #ccc', fontWeight: 700 }}>+</button>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', width: '75px', textAlign: 'right' }}>
                      {formatRupiah(item.subtotal)}
                    </div>

                    <button onClick={() => handleRemoveItem(idx)} style={{ color: 'var(--color-slate-400)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Total & Button */}
          <div style={{ borderTop: '1px solid var(--color-slate-200)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-slate-600)' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>{formatRupiah(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--color-slate-600)', fontSize: '0.875rem' }}>Diskon (Rp):</span>
              <input
                type="number"
                className="form-input"
                style={{ width: '100px', textAlign: 'right', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>TOTAL BAYAR:</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary-700)' }}>
                {formatRupiah(total)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              <Printer size={20} />
              <span>Bayar & Cetak Struk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

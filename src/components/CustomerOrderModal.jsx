import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Send, 
  X, 
  CheckCircle2, 
  Store,
  User,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';
import { formatRupiah } from '../utils/storage';

export default function CustomerOrderModal({ products, storeSettings, onClose, onSendOrder }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer / QRIS');
  const [orderSent, setOrderSent] = useState(false);

  const sellerPhone = storeSettings.phone || '0857-5243-4322';

  const handleAddToCart = (prod) => {
    const existingIndex = cart.findIndex(item => item.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      updated[existingIndex].subtotal = updated[existingIndex].qty * prod.price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          qty: 1,
          subtotal: prod.price,
          unit: prod.unit || 'pcs'
        }
      ]);
    }
  };

  const handleUpdateQty = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].qty + delta;
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      updated[index].qty = newQty;
      updated[index].subtotal = newQty * updated[index].price;
      setCart(updated);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Pilih minimal 1 produk menu untuk memesan!");
      return;
    }
    if (!customerName.trim()) {
      alert("Harap isi Nama Anda!");
      return;
    }

    // Format WhatsApp text
    let waText = `Halo ${storeSettings.name}! Saya mau pesan ya:\n\n`;
    waText += `👤 *Nama:* ${customerName}\n`;
    if (customerPhone) waText += `📱 *No. WA:* ${customerPhone}\n`;
    if (address) waText += `📍 *Alamat:* ${address}\n`;
    waText += `💳 *Pembayaran:* ${paymentMethod}\n\n`;

    waText += `📋 *Rincian Pesanan:*\n`;
    cart.forEach(item => {
      waText += `• ${item.qty}x ${item.name} (@ ${formatRupiah(item.price)})\n`;
    });

    waText += `\n💵 *Total Pesanan:* ${formatRupiah(subtotal)}\n`;
    if (notes) waText += `📝 *Catatan:* ${notes}\n\n`;
    waText += `Mohon dikonfirmasi dan dibuatkan struk cetaknya ya kak! Terima kasih.`;

    const pendingOrderObj = {
      id: `WA-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customerName: customerName,
      customerPhone: customerPhone,
      address: address,
      notes: notes,
      paymentMethod: paymentMethod,
      items: cart,
      subtotal: subtotal,
      shippingFee: 0,
      discount: 0,
      total: subtotal,
      rawText: waText,
      status: 'pending_review' // pending_review -> confirmed -> printed
    };

    // Save to inbox queue for seller
    onSendOrder(pendingOrderObj);

    // Clean phone number for wa.me link
    const cleanSellerPhone = sellerPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const waUrl = `https://wa.me/${cleanSellerPhone}?text=${encodeURIComponent(waText)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');
    setOrderSent(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header Pembeli */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                Formulir Pemesanan Pembeli (E-Menu)
              </h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                Kirim langsung ke WhatsApp Penjual: <strong>{sellerPhone}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ color: '#ffffff', opacity: 0.8, padding: '0.25rem' }}>
            <X size={24} />
          </button>
        </div>

        {orderSent ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
              Pesanan Berhasil Dikirim ke WA Penjual!
            </h3>
            <p style={{ color: 'var(--color-slate-600)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9375rem' }}>
              Aplikasi WhatsApp telah terbuka. Pesanan juga secara otomatis telah masuk ke <strong>Dashboard Review Penjual ({sellerPhone})</strong> untuk langsung dikonfirmasi & dicetak struknya.
            </p>
            <button onClick={onClose} className="btn btn-primary btn-lg">
              Selesai & Kembali
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', flex: 1, overflow: 'hidden' }}>
            {/* Catalog (Left 7 Cols) */}
            <div style={{ gridColumn: 'span 7', padding: '1.25rem', overflowY: 'auto', borderRight: '1px solid var(--color-slate-200)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-slate-800)' }}>
                Pilih Menu Makanan & Minuman:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.875rem' }}>
                {products.map(prod => (
                  <div
                    key={prod.id}
                    style={{
                      border: '1px solid var(--color-slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.875rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: '#ffffff'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>{prod.category}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-slate-900)', margin: '0.25rem 0' }}>{prod.name}</div>
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary-700)', fontSize: '0.875rem' }}>
                        {formatRupiah(prod.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Plus size={14} /> Tambah
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer Cart & Form (Right 5 Cols) */}
            <div style={{ gridColumn: 'span 5', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-slate-50)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                Keranjang Pesanan ({cart.reduce((s, i) => s + i.qty, 0)})
              </h4>

              {/* Cart List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {cart.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-slate-400)', fontSize: '0.8125rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
                    Belum ada menu yang dipilih
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>@{formatRupiah(item.price)}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => handleUpdateQty(idx, -1)} style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#e2e8f0', fontWeight: 700 }}>-</button>
                        <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{item.qty}</span>
                        <button onClick={() => handleUpdateQty(idx, 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#e2e8f0', fontWeight: 700 }}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Anda (Pembeli) *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Contoh: Kak Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>No. WhatsApp Anda</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="0812-..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Metode Bayar</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
                    >
                      <option value="Transfer / QRIS">Transfer / QRIS</option>
                      <option value="COD (Cash)">COD (Cash)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Alamat Pengiriman</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Jl. Anggrek No. 12..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Catatan Khusus</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Less ice, manis pas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--color-slate-200)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700 }}>Total Pesanan:</span>
                    <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-primary-700)' }}>
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-wa btn-lg"
                    style={{ width: '100%' }}
                    disabled={cart.length === 0}
                  >
                    <Send size={18} />
                    <span>Kirim Pesanan ke WA Penjual</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

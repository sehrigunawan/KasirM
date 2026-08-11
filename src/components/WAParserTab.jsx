import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  FileText,
  User,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  PlusCircle,
  Clipboard
} from 'lucide-react';
import { parseWaMessage } from '../utils/waParser';
import { SAMPLE_WA_MESSAGES } from '../data/initialData';
import { formatRupiah } from '../utils/storage';

export default function WAParserTab({ products, onProcessReceipt, onAddToCart }) {
  const [rawText, setRawText] = useState(SAMPLE_WA_MESSAGES[0].text);
  const [parsedData, setParsedData] = useState(null);
  const [customDiscount, setCustomDiscount] = useState(0);

  // Re-parse when text or products list changes
  useEffect(() => {
    if (rawText) {
      const parsed = parseWaMessage(rawText, products);
      setParsedData(parsed);
    } else {
      setParsedData(null);
    }
  }, [rawText, products]);

  const handleSampleClick = (sampleText) => {
    setRawText(sampleText);
  };

  const handleUpdateItemQty = (index, delta) => {
    if (!parsedData) return;
    const newItems = [...parsedData.items];
    const newQty = Math.max(1, newItems[index].qty + delta);
    newItems[index].qty = newQty;
    newItems[index].subtotal = newItems[index].price * newQty;
    setParsedData({ ...parsedData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    if (!parsedData) return;
    const newItems = parsedData.items.filter((_, i) => i !== index);
    setParsedData({ ...parsedData, items: newItems });
  };

  const handleAddUnmatchedAsItem = (unmatchedObj) => {
    if (!parsedData) return;
    const newItem = {
      productId: `CUSTOM-${Date.now()}`,
      name: unmatchedObj.suggestedName,
      price: 15000, // Default estimated price
      qty: unmatchedObj.suggestedQty || 1,
      subtotal: 15000 * (unmatchedObj.suggestedQty || 1),
      stockAvailable: 999,
      unit: 'pcs',
      isCustom: true
    };

    const newUnmatched = parsedData.unmatchedLines.filter(u => u !== unmatchedObj);
    setParsedData({
      ...parsedData,
      items: [...parsedData.items, newItem],
      unmatchedLines: newUnmatched
    });
  };

  const handleLinkProductToUnmatched = (unmatchedObj, productId) => {
    const selectedProd = products.find(p => p.id === productId);
    if (!selectedProd) return;

    const newItem = {
      productId: selectedProd.id,
      name: selectedProd.name,
      price: selectedProd.price,
      qty: unmatchedObj.suggestedQty || 1,
      subtotal: selectedProd.price * (unmatchedObj.suggestedQty || 1),
      stockAvailable: selectedProd.stock,
      unit: selectedProd.unit || 'pcs'
    };

    const newUnmatched = parsedData.unmatchedLines.filter(u => u !== unmatchedObj);
    setParsedData({
      ...parsedData,
      items: [...parsedData.items, newItem],
      unmatchedLines: newUnmatched
    });
  };

  const calculateSubtotal = () => {
    if (!parsedData || !parsedData.items) return 0;
    return parsedData.items.reduce((sum, item) => sum + (item.subtotal || item.price * item.qty), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = parsedData ? parsedData.shippingFee : 0;
  const total = Math.max(0, subtotal + shippingFee - customDiscount);

  const handleCreateReceipt = () => {
    if (!parsedData || parsedData.items.length === 0) {
      alert("Harap masukkan pesan WhatsApp yang memiliki item pesanan valid!");
      return;
    }

    const transaction = {
      id: `WA-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customerName: parsedData.customerName || 'Pelanggan WA',
      customerPhone: parsedData.customerPhone || '',
      address: parsedData.address || '',
      notes: parsedData.notes || '',
      paymentMethod: parsedData.paymentMethod || 'Transfer WA',
      items: parsedData.items,
      subtotal: subtotal,
      shippingFee: shippingFee,
      discount: customDiscount,
      total: total,
      channel: 'WhatsApp'
    };

    onProcessReceipt(transaction);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      {/* Left Column: WA Input & Presets */}
      <div style={{ gridColumn: 'span 5' }}>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>Pesan Chat WhatsApp Murni</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>Diterima di WhatsApp Penjual: <strong>0857-5243-4322</strong></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setRawText(text);
                  } catch (e) {
                    alert("Gagal membaca clipboard. Silakan gunakan Ctrl+V di kolom teks.");
                  }
                }}
                className="btn btn-wa btn-sm"
                title="Paste Pesan dari Clipboard"
              >
                <Clipboard size={14} />
                <span>Paste WA</span>
              </button>

              <button 
                onClick={() => setRawText('')}
                className="btn btn-secondary btn-sm"
                title="Kosongkan Teks"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Sample Presets Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', marginBottom: '0.5rem' }}>
              💡 Contoh Format Pesan WA (Klik 1-Kali):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {SAMPLE_WA_MESSAGES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample.text)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.625rem' }}
                >
                  <Sparkles size={12} style={{ color: 'var(--color-primary-600)' }} />
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <textarea
              className="form-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Contoh:&#10;Nama: Kak Budi&#10;2x Kopi Susu Aren&#10;1x Roti Bakar Cokelat&#10;Metode: QRIS&#10;Ongkir: 10000"
              style={{
                flex: 1,
                minHeight: '260px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-slate-50)',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Realtime Parsed Order Breakdown & Action */}
      <div style={{ gridColumn: 'span 7' }}>
        {parsedData ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info extracted */}
            <div style={{ borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-wa">
                  <CheckCircle size={14} /> Otomatis Terdeteksi oleh Smart Parser
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                  Total {parsedData.items.length} Item Ditemukan
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: 'var(--color-slate-50)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.125rem' }}>
                    <User size={14} /> Nama Pembeli:
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={parsedData.customerName}
                    onChange={(e) => setParsedData({ ...parsedData, customerName: e.target.value })}
                    style={{ padding: '0.25rem 0.5rem', fontWeight: 700 }}
                  />
                </div>

                <div style={{ background: 'var(--color-slate-50)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.125rem' }}>
                    <CreditCard size={14} /> Metode Pembayaran:
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={parsedData.paymentMethod}
                    onChange={(e) => setParsedData({ ...parsedData, paymentMethod: e.target.value })}
                    style={{ padding: '0.25rem 0.5rem', fontWeight: 600 }}
                  />
                </div>

                {parsedData.address && (
                  <div style={{ gridColumn: 'span 2', background: 'var(--color-slate-50)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.125rem' }}>
                      <MapPin size={14} /> Alamat Pengiriman:
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={parsedData.address}
                      onChange={(e) => setParsedData({ ...parsedData, address: e.target.value })}
                      style={{ padding: '0.25rem 0.5rem' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Matched Products List */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText size={16} style={{ color: 'var(--color-primary-600)' }} />
                Item Pesanan (Cocok dengan Stok Toko):
              </h4>

              {parsedData.items.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
                  Belum ada item pesanan yang terdeteksi dari pesan di samping.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {parsedData.items.map((item, idx) => {
                    const isStockLow = item.stockAvailable !== undefined && item.stockAvailable < item.qty;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                          padding: '0.625rem 0.875rem',
                          background: '#ffffff',
                          border: isStockLow ? '1px solid #fecaca' : '1px solid var(--color-slate-200)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-slate-900)' }}>
                              {item.name}
                            </span>
                            {item.isCustom ? (
                              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Manual Custom</span>
                            ) : isStockLow ? (
                              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                                <AlertTriangle size={10} /> Stok Sisa {item.stockAvailable}
                              </span>
                            ) : (
                              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Stok Aman</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                            @{formatRupiah(item.price)} / {item.unit}
                          </div>
                        </div>

                        {/* Qty controller & subtotal */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-slate-100)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                            <button
                              onClick={() => handleUpdateItemQty(idx, -1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--color-slate-300)', fontWeight: 700 }}
                            >
                              -
                            </button>
                            <span style={{ padding: '0 0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>{item.qty}</span>
                            <button
                              onClick={() => handleUpdateItemQty(idx, 1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#ffffff', border: '1px solid var(--color-slate-300)', fontWeight: 700 }}
                            >
                              +
                            </button>
                          </div>

                          <div style={{ width: '90px', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary-700)' }}>
                            {formatRupiah(item.subtotal || item.price * item.qty)}
                          </div>

                          <button
                            onClick={() => handleRemoveItem(idx)}
                            style={{ color: 'var(--color-slate-400)', padding: '0.25rem' }}
                            title="Hapus item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unmatched Lines Warning (If Any) */}
            {parsedData.unmatchedLines && parsedData.unmatchedLines.length > 0 && (
              <div style={{ background: 'var(--color-warning-bg)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} />
                  <span>Ada {parsedData.unmatchedLines.length} Teks Pesanan Belum Terhubung dengan Produk Stok:</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {parsedData.unmatchedLines.map((unmatched, uIdx) => (
                    <div key={uIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7' }}>
                      <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>"{unmatched.rawLine}"</span>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <select
                          className="form-select"
                          style={{ padding: '0.25rem', fontSize: '0.75rem', width: '160px' }}
                          onChange={(e) => {
                            if (e.target.value) handleLinkProductToUnmatched(unmatched, e.target.value);
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Pilih Produk Stok...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.price)})</option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleAddUnmatchedAsItem(unmatched)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem' }}
                        >
                          <PlusCircle size={12} /> + Custom Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtotal, Shipping, Discount & Total */}
            <div style={{ background: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-slate-600)' }}>Subtotal Produk:</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-slate-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Truck size={14} /> Biaya Pengiriman / Ongkir:
                  </span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '120px', textAlign: 'right', padding: '0.25rem 0.5rem' }}
                    value={parsedData.shippingFee}
                    onChange={(e) => setParsedData({ ...parsedData, shippingFee: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-slate-600)' }}>Diskon Tambahan (Rp):</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '120px', textAlign: 'right', padding: '0.25rem 0.5rem' }}
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div style={{ borderTop: '1px dashed var(--color-slate-300)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>TOTAL BAYAR:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleCreateReceipt}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                <Printer size={20} />
                <span>Proses & Cetak Struk WA</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-400)' }}>
            Silakan masukkan teks pesan WhatsApp di sebelah kiri untuk melihat deteksi pesanan & struk secara langsung.
          </div>
        )}
      </div>
    </div>
  );
}

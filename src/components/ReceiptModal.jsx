import React, { useState } from 'react';
import { Printer, Copy, Check, X, Share2, Sparkles } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/storage';

export default function ReceiptModal({ transaction, onClose, onComplete, storeSettings }) {
  const [copied, setCopied] = useState(false);
  const [paperWidth, setPaperWidth] = useState(storeSettings.paperSize || '58mm');

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
    if (onComplete) {
      onComplete(transaction);
    }
  };

  const generateWaTextReceipt = () => {
    let text = `=========================\n`;
    text += `   *${storeSettings.name.toUpperCase()}*\n`;
    text += `   ${storeSettings.address}\n`;
    text += `   Telp: ${storeSettings.phone}\n`;
    text += `=========================\n`;
    text += `No Struk : #${transaction.id}\n`;
    text += `Tgl      : ${formatDate(transaction.date || new Date())}\n`;
    text += `Nama     : ${transaction.customerName}\n`;
    if (transaction.customerPhone) text += `No. WA   : ${transaction.customerPhone}\n`;
    if (transaction.address) text += `Alamat   : ${transaction.address}\n`;
    text += `Bayar    : ${transaction.paymentMethod}\n`;
    text += `-------------------------\n`;
    
    transaction.items.forEach(item => {
      text += `• ${item.name}\n`;
      text += `  ${item.qty}x @ ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal || item.price * item.qty)}\n`;
    });

    text += `-------------------------\n`;
    text += `Subtotal : ${formatRupiah(transaction.subtotal)}\n`;
    if (transaction.shippingFee > 0) {
      text += `Ongkir   : ${formatRupiah(transaction.shippingFee)}\n`;
    }
    if (transaction.discount > 0) {
      text += `Diskon   : -${formatRupiah(transaction.discount)}\n`;
    }
    text += `*TOTAL    : ${formatRupiah(transaction.total)}*\n`;
    text += `=========================\n`;
    if (transaction.notes) {
      text += `Catatan  : ${transaction.notes}\n`;
    }
    text += `${storeSettings.receiptFooter}\n`;

    return text;
  };

  const handleCopyText = () => {
    const text = generateWaTextReceipt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-slate-200)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'var(--color-slate-50)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--color-primary-600)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              Pratinjau Struk Kasir
            </h3>
          </div>

          <button onClick={onClose} style={{ color: 'var(--color-slate-400)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Paper Size selector bar */}
        <div style={{
          padding: '0.5rem 1.25rem',
          background: '#f8fafc',
          borderBottom: '1px solid var(--color-slate-200)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          fontSize: '0.8125rem'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-slate-600)' }}>Format Thermal Printer:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`btn btn-sm ${paperWidth === '58mm' ? 'btn-primary' : 'btn-secondary'}`}
            >
              58mm Roll
            </button>
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`btn btn-sm ${paperWidth === '80mm' ? 'btn-primary' : 'btn-secondary'}`}
            >
              80mm Roll
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#e2e8f0' }}>
          <div className="receipt-paper" style={{ maxWidth: paperWidth === '80mm' ? '380px' : '300px' }}>
            <div className="receipt-header">
              <div className="receipt-title">{storeSettings.name}</div>
              <div>{storeSettings.address}</div>
              <div>WA: {storeSettings.phone}</div>
            </div>

            <div style={{ fontSize: '11px', marginBottom: '8px' }}>
              <div>No. Struk: #{transaction.id}</div>
              <div>Tgl: {formatDate(transaction.date || new Date())}</div>
              <div>Pelanggan: <strong>{transaction.customerName}</strong></div>
              {transaction.customerPhone && <div>No. WA: {transaction.customerPhone}</div>}
              {transaction.address && <div>Alamat: {transaction.address}</div>}
              <div>Bayar: {transaction.paymentMethod}</div>
              <div>Sumber: {transaction.channel || 'WhatsApp'}</div>
            </div>

            <div className="receipt-divider" />

            <div>
              {transaction.items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '6px' }}>
                  <div className="receipt-item-row">
                    <span className="receipt-item-name">{item.name}</span>
                  </div>
                  <div className="receipt-subrow">
                    <span>{item.qty} x {formatRupiah(item.price)}</span>
                    <span>{formatRupiah(item.subtotal || item.price * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="receipt-divider" />

            <div style={{ fontSize: '11px' }}>
              <div className="receipt-item-row">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.shippingFee > 0 && (
                <div className="receipt-item-row">
                  <span>Ongkir:</span>
                  <span>{formatRupiah(transaction.shippingFee)}</span>
                </div>
              )}
              {transaction.discount > 0 && (
                <div className="receipt-item-row">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              <div className="receipt-divider" />
              <div className="receipt-item-row" style={{ fontWeight: 'bold', fontSize: '13px' }}>
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {transaction.notes && (
              <>
                <div className="receipt-divider" />
                <div style={{ fontSize: '10px' }}>
                  <strong>Catatan:</strong> {transaction.notes}
                </div>
              </>
            )}

            <div className="receipt-footer">
              {storeSettings.receiptFooter}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--color-slate-200)',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          background: '#ffffff'
        }}>
          <button
            onClick={handleCopyText}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            {copied ? <Check size={18} style={{ color: '#10b981' }} /> : <Copy size={18} />}
            <span>{copied ? 'Teks WA Tersalin!' : 'Salin Teks WA'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ flex: 1.5 }}
          >
            <Printer size={18} />
            <span>Cetak Thermal Printer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

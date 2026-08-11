import React from 'react';
import { formatRupiah, formatDate } from '../utils/storage';

export default function PrintReceipt({ transaction, storeSettings }) {
  if (!transaction) return null;

  const {
    id,
    date,
    customerName,
    customerPhone,
    address,
    notes,
    items = [],
    subtotal = 0,
    shippingFee = 0,
    discount = 0,
    total = 0,
    paymentMethod = 'Tunai',
    channel = 'WhatsApp'
  } = transaction;

  const paperSizeClass = storeSettings.paperSize === '80mm' ? 'size-80mm' : 'size-58mm';

  return (
    <div className={`printable-receipt ${paperSizeClass}`}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {storeSettings.name}
        </h2>
        <p style={{ fontSize: '10px' }}>{storeSettings.address}</p>
        <p style={{ fontSize: '10px' }}>Telp/WA: {storeSettings.phone}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      <div style={{ fontSize: '10px' }}>
        <div>No. Struk : #{id}</div>
        <div>Tanggal   : {formatDate(date || new Date())}</div>
        <div>Pelanggan : {customerName}</div>
        {customerPhone && <div>No. WA    : {customerPhone}</div>}
        {address && <div>Alamat    : {address}</div>}
        <div>Sumber    : {channel}</div>
        <div>Pembayaran: {paymentMethod}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Items */}
      <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left' }}>
            <th style={{ paddingBottom: '2px' }}>Item</th>
            <th style={{ textAlign: 'center', paddingBottom: '2px' }}>Qty</th>
            <th style={{ textAlign: 'right', paddingBottom: '2px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ paddingTop: '3px' }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>
                  @{formatRupiah(item.price)}
                </div>
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '3px' }}>
                {item.qty}
              </td>
              <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '3px' }}>
                {formatRupiah(item.subtotal || item.price * item.qty)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Summary */}
      <div style={{ fontSize: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>

        {shippingFee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Ongkir:</span>
            <span>{formatRupiah(shippingFee)}</span>
          </div>
        )}

        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Diskon:</span>
            <span>-{formatRupiah(discount)}</span>
          </div>
        )}

        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
          <span>TOTAL:</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>

      {notes && (
        <>
          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ fontSize: '9px' }}>
            <strong>Catatan:</strong> {notes}
          </div>
        </>
      )}

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0 4px 0' }} />

      <div style={{ textAlign: 'center', fontSize: '9px', whiteSpace: 'pre-line' }}>
        {storeSettings.receiptFooter}
      </div>
    </div>
  );
}

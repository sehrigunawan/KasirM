import React from 'react';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Printer, 
  Sparkles, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  Clock,
  Send,
  AlertTriangle
} from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/storage';

export default function PendingOrdersTab({ 
  pendingOrders, 
  onConfirmOrder, 
  onRejectOrder, 
  onSimulateNewOrder,
  onOpenCustomerOrderModal 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Control */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
              Inbox Pesanan WhatsApp Masuk ({pendingOrders.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
              Nomor WhatsApp Penjual Active: <strong>0857-5243-4322</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={onOpenCustomerOrderModal} className="btn btn-secondary">
            <Send size={18} style={{ color: 'var(--color-primary-600)' }} />
            <span>Tampilan Menu Pembeli</span>
          </button>

          <button onClick={onSimulateNewOrder} className="btn btn-wa">
            <Sparkles size={18} />
            <span>⚡ Simulasi Pembeli Kirim Pesanan WA Baru</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {pendingOrders.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--color-slate-500)' }}>
          <Inbox size={48} style={{ color: 'var(--color-slate-300)', marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-slate-800)', marginBottom: '0.5rem' }}>
            Belum ada pesanan WhatsApp yang menunggu konfirmasi
          </h4>
          <p style={{ fontSize: '0.875rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Klik tombol <strong>"⚡ Simulasi Pembeli Kirim Pesanan WA Baru"</strong> di atas atau buka <strong>"Tampilan Menu Pembeli"</strong> untuk mencoba alur pesanan dari pembeli ke nomor WA <strong>0857-5243-4322</strong>.
          </p>
          <button onClick={onSimulateNewOrder} className="btn btn-primary">
            <Sparkles size={18} />
            <span>Coba Simulasi Pesanan Masuk Sekarang</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pendingOrders.map(order => (
            <div key={order.id} className="card" style={{ border: '2px solid var(--color-primary-100)', padding: '1.25rem' }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.875rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-wa" style={{ fontSize: '0.75rem' }}>
                    <Clock size={12} /> Pesanan Baru #{order.id}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
                    {formatDate(order.date)}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                  Total Pesanan: {formatRupiah(order.total)}
                </div>
              </div>

              {/* Customer Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1rem', background: 'var(--color-slate-50)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} /> Pembeli:
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{order.customerName}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={12} /> No. WA Pembeli:
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customerPhone || '-'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CreditCard size={12} /> Metode Bayar:
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.paymentMethod}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} /> Alamat Pengiriman:
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>{order.address || 'Ambil di Toko'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-slate-700)', marginBottom: '0.5rem' }}>
                  Rincian Item Yang Dipesan Pembeli:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-200)', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>{item.qty}x</span>
                        <span>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                          (@ {formatRupiah(item.price)})
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>
                        {formatRupiah(item.subtotal || item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div style={{ fontSize: '0.8125rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <strong>Catatan Pembeli:</strong> {order.notes}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-slate-200)', paddingTop: '1rem' }}>
                <button
                  onClick={() => onRejectOrder(order.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <XCircle size={16} /> Batalkan / Tolak
                </button>

                <button
                  onClick={() => onConfirmOrder(order)}
                  className="btn btn-primary"
                >
                  <Printer size={18} />
                  <span>Konfirmasi Pesanan & Cetak Struk</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

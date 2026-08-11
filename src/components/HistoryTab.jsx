import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Printer, 
  MessageSquare, 
  ShoppingCart, 
  Calendar, 
  User, 
  Trash2,
  FileText
} from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/storage';

export default function HistoryTab({ transactions, onReprint, onClearHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('Semua');

  const filtered = transactions.filter(t => {
    const matchesChannel = channelFilter === 'Semua' || t.channel === channelFilter;
    const matchesSearch = (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.id && t.id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Filters */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari ID struk atau nama pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Semua', 'WhatsApp', 'Kasir Offline'].map(ch => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`btn btn-sm ${channelFilter === ch ? 'btn-primary' : 'btn-secondary'}`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Hapus seluruh riwayat transaksi struk?")) {
                onClearHistory();
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={14} /> Hapus Riwayat
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-slate-50)', borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-slate-600)', fontWeight: 600 }}>
                <th style={{ padding: '0.875rem 1rem' }}>No. Struk / Tgl</th>
                <th style={{ padding: '0.875rem 1rem' }}>Sumber</th>
                <th style={{ padding: '0.875rem 1rem' }}>Pelanggan</th>
                <th style={{ padding: '0.875rem 1rem' }}>Rincian Item</th>
                <th style={{ padding: '0.875rem 1rem' }}>Pembayaran</th>
                <th style={{ padding: '0.875rem 1rem' }}>Total Struk</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-400)' }}>
                    Belum ada riwayat transaksi yang tersimpan.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-slate-900)', fontFamily: 'var(--font-mono)' }}>#{t.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>{formatDate(t.date)}</div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${t.channel === 'WhatsApp' ? 'badge-wa' : 'badge-secondary'}`}>
                        {t.channel === 'WhatsApp' ? <MessageSquare size={12} /> : <ShoppingCart size={12} />}
                        {t.channel}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700 }}>{t.customerName}</div>
                      {t.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>WA: {t.customerPhone}</div>}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-slate-700)' }}>
                        {t.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{t.paymentMethod}</span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                      {formatRupiah(t.total)}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => onReprint(t)}
                        className="btn btn-primary btn-sm"
                      >
                        <Printer size={14} /> Cetak Struk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

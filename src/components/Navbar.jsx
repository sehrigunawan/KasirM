import React from 'react';
import { 
  MessageSquare, 
  ShoppingCart, 
  Package, 
  History, 
  Settings, 
  Store,
  TrendingUp,
  Receipt,
  Inbox,
  Send
} from 'lucide-react';
import { formatRupiah } from '../utils/storage';

export default function Navbar({ activeTab, setActiveTab, storeSettings, dailyStats, pendingCount, onOpenCustomerModal }) {
  const navItems = [
    { id: 'pending', label: 'Inbox Pesanan WA', icon: Inbox, count: pendingCount, highlight: pendingCount > 0 },
    { id: 'wa-parser', label: 'Cetak Struk WA', icon: MessageSquare, badge: 'Parser Teks' },
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Stok & Harga', icon: Package, count: dailyStats.lowStockCount },
    { id: 'history', label: 'Riwayat Struk', icon: History },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid var(--color-slate-200)', sticky: 'top', zIndex: 10 }}>
      {/* Top Banner Bar */}
      <div style={{ background: 'var(--color-slate-900)', color: '#ffffff', padding: '0.5rem 1.5rem', fontSize: '0.8125rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={16} style={{ color: 'var(--color-primary-500)' }} />
            <span style={{ fontWeight: 700 }}>{storeSettings.name}</span>
            <span style={{ opacity: 0.6 }}>| {storeSettings.phone}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <TrendingUp size={14} style={{ color: '#10b981' }} />
              <span style={{ opacity: 0.8 }}>Omset Hari Ini:</span>
              <span style={{ fontWeight: 700, color: '#34d399' }}>{formatRupiah(dailyStats.todayTotal)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Receipt size={14} style={{ color: '#38bdf8' }} />
              <span style={{ opacity: 0.8 }}>Trans:</span>
              <span style={{ fontWeight: 700 }}>{dailyStats.todayCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Tabs */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
          }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1.2 }}>
              Kasir<span style={{ color: 'var(--color-primary-600)' }}>Pintar</span> WA
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
              Cetak Struk Pesanan WA & Manajemen Stok
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary-50)' : item.highlight ? '#dcfce7' : 'transparent',
                  color: isActive ? 'var(--color-primary-700)' : item.highlight ? '#15803d' : 'var(--color-slate-600)',
                  border: isActive ? '1px solid var(--color-primary-100)' : item.highlight ? '1px solid #86efac' : '1px solid transparent',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.875rem',
                  position: 'relative'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--color-primary-600)' : item.highlight ? '#16a34a' : 'var(--color-slate-400)' }} />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className={`badge ${item.id === 'pending' ? 'badge-wa' : 'badge-danger'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {item.count} {item.id === 'pending' ? 'Baru' : 'Stok Tipis'}
                  </span>
                )}
                {item.badge && (
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onOpenCustomerModal}
            className="btn btn-wa"
            style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
          >
            <Send size={16} />
            <span>Menu Pembeli</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

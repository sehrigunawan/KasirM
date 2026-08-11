import React, { useState } from 'react';
import { Settings, Store, Printer, Save, RefreshCw, Check } from 'lucide-react';

export default function SettingsTab({ storeSettings, onSaveSettings, onResetData }) {
  const [formData, setFormData] = useState({ ...storeSettings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pengaturan Toko & Struk Kasir</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>Atur nama toko, alamat, footer struk, dan ukuran printer thermal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Nama Toko / Usaha:</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Alamat Toko (Muncul di Header Struk):</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Nomor Telepon / WhatsApp Toko:</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Pesan Kaki Struk (Receipt Footer):</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--color-slate-200)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} /> Ukuran Kertas Thermal Printer Default:
            </h4>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ flex: 1, border: formData.paperSize === '58mm' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-slate-200)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: formData.paperSize === '58mm' ? 'var(--color-primary-50)' : '#fff' }}>
                <input
                  type="radio"
                  name="paperSize"
                  value="58mm"
                  checked={formData.paperSize === '58mm'}
                  onChange={() => setFormData({ ...formData, paperSize: '58mm' })}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>58mm Roll (Mini Thermal Printer POS)</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>Standard printer kasir bluetooth/USB portable</p>
              </label>

              <label style={{ flex: 1, border: formData.paperSize === '80mm' ? '2px solid var(--color-primary-600)' : '1px solid var(--color-slate-200)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: formData.paperSize === '80mm' ? 'var(--color-primary-50)' : '#fff' }}>
                <input
                  type="radio"
                  name="paperSize"
                  value="80mm"
                  checked={formData.paperSize === '80mm'}
                  onChange={() => setFormData({ ...formData, paperSize: '80mm' })}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>80mm Roll (Desktop Thermal Printer)</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>Lebar kertas restoran/supermarket standard</p>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              {saved ? <Check size={18} /> : <Save size={18} />}
              <span>{saved ? 'Pengaturan Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone / Reset data */}
      <div className="card" style={{ border: '1px solid #fecaca', background: '#fef2f2' }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
          Reset Data Aplikasi
        </h4>
        <p style={{ fontSize: '0.8125rem', color: '#7f1d1d', marginBottom: '1rem' }}>
          Kembalikan seluruh produk, stok, dan riwayat ke contoh data bawaan aplikasi.
        </p>

        <button
          onClick={() => {
            if (confirm("Apakah Anda yakin ingin me-reset seluruh data ke awal?")) {
              onResetData();
            }
          }}
          className="btn btn-danger btn-sm"
        >
          <RefreshCw size={14} /> Reset Data ke Awal
        </button>
      </div>
    </div>
  );
}

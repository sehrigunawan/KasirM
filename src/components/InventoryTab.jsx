import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  DollarSign,
  X,
  Check
} from 'lucide-react';
import { formatRupiah } from '../utils/storage';

export default function InventoryTab({ products, onSaveProducts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Minuman',
    sku: '',
    costPrice: 0,
    price: 0,
    stock: 10,
    minStock: 5,
    unit: 'pcs',
    aliasesStr: ''
  });

  const categories = ['Semua', ...new Set(products.map(p => p.category))];

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Minuman',
      sku: `PRD-${Date.now().toString().slice(-4)}`,
      costPrice: 5000,
      price: 15000,
      stock: 20,
      minStock: 5,
      unit: 'pcs',
      aliasesStr: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      sku: prod.sku,
      costPrice: prod.costPrice || 0,
      price: prod.price,
      stock: prod.stock,
      minStock: prod.minStock,
      unit: prod.unit || 'pcs',
      aliasesStr: (prod.aliases || []).join(', ')
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const aliases = formData.aliasesStr
      ? formData.aliasesStr.split(',').map(a => a.trim().toLowerCase()).filter(Boolean)
      : [formData.name.toLowerCase()];

    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData,
        costPrice: Number(formData.costPrice),
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        aliases
      } : p);
      onSaveProducts(updated);
    } else {
      const newProd = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        ...formData,
        costPrice: Number(formData.costPrice),
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        aliases
      };
      onSaveProducts([newProd, ...products]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini dari stok?")) {
      onSaveProducts(products.filter(p => p.id !== id));
    }
  };

  const handleQuickAdjustStock = (id, delta) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Low Stock Banner Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: 'var(--color-warning-bg)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} style={{ color: '#b45309' }} />
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#92400e' }}>
                Peringatan Stok Tipis ({lowStockProducts.length} Produk)
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#b45309' }}>
                {lowStockProducts.map(p => `${p.name} (Sisa ${p.stock})`).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Header & Filters */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari nama produk, SKU, atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '160px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Product Stock Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-slate-50)', borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-slate-600)', fontWeight: 600 }}>
                <th style={{ padding: '0.875rem 1rem' }}>SKU / Nama Produk</th>
                <th style={{ padding: '0.875rem 1rem' }}>Kategori</th>
                <th style={{ padding: '0.875rem 1rem' }}>Harga Modal (HPP)</th>
                <th style={{ padding: '0.875rem 1rem' }}>Harga Jual</th>
                <th style={{ padding: '0.875rem 1rem' }}>Profit Margin</th>
                <th style={{ padding: '0.875rem 1rem' }}>Stok Saat Ini</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-slate-400)' }}>
                    Tidak ada produk yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const profit = p.price - (p.costPrice || 0);
                  const marginPct = p.price > 0 ? Math.round((profit / p.price) * 100) : 0;
                  const isLow = p.stock <= p.minStock;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', fontFamily: 'var(--font-mono)' }}>
                          {p.sku} {p.aliases && p.aliases.length > 0 && `• Alias WA: ${p.aliases.join(', ')}`}
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className="badge badge-secondary" style={{ background: 'var(--color-slate-100)', color: 'var(--color-slate-700)' }}>
                          {p.category}
                        </span>
                      </td>

                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-slate-600)' }}>
                        {formatRupiah(p.costPrice || 0)}
                      </td>

                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-primary-700)' }}>
                        {formatRupiah(p.price)}
                      </td>

                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 600, fontSize: '0.8125rem' }}>
                          <TrendingUp size={14} />
                          <span>+{formatRupiah(profit)} ({marginPct}%)</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                            {p.stock} {p.unit}
                          </span>

                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                              onClick={() => handleQuickAdjustStock(p.id, -1)}
                              style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#e2e8f0', fontWeight: 700, fontSize: '0.75rem' }}
                              title="Kurangi 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleQuickAdjustStock(p.id, 1)}
                              style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#e2e8f0', fontWeight: 700, fontSize: '0.75rem' }}
                              title="Tambah Restock 1"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                          <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary btn-sm" title="Edit Produk">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {editingProduct ? 'Edit Produk & Harga' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label className="form-label">Nama Produk:</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kopi Susu Aren"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Kategori:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Kode SKU / Barcode:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Harga Modal (HPP):</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Stok Awal:</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Min. Alert:</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Satuan:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, cup..."
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Kata Kunci / Alias WA (Pisahkan dengan koma):</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.aliasesStr}
                  onChange={(e) => setFormData({ ...formData, aliasesStr: e.target.value })}
                  placeholder="koparen, kopi aren, es kopi susu"
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)' }}>
                  Berguna agar parser WA otomatis mengenali nama singkatan dari pembeli.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

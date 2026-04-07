import { useState, useEffect } from 'react';
import { productsApi, inventoryApi } from '../api';
import { useToast } from '../Toast';

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

function ProductModal({ product, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    category: product?.category || '',
    cost_price: product?.cost_price || '',
    selling_price: product?.selling_price || '',
    stock_quantity: product?.stock_quantity ?? 0,
    reorder_level: product?.reorder_level ?? 10,
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        barcode: form.barcode.trim() || null,
        category: form.category.trim() || null,
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        stock_quantity: parseInt(form.stock_quantity),
        reorder_level: parseInt(form.reorder_level),
      };
      if (isEdit) {
        await productsApi.update(product.id, payload);
        toast('Product updated successfully');
      } else {
        await productsApi.create(payload);
        toast('Product added successfully');
      }
      onSaved();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input className="form-control" value={form.name} onChange={set('name')} required placeholder="e.g. Indomie Noodles" />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Barcode</label>
              <input className="form-control" value={form.barcode} onChange={set('barcode')} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" value={form.category} onChange={set('category')} placeholder="e.g. Food" />
            </div>
            <div className="form-group">
              <label>Cost Price (₦) *</label>
              <input className="form-control" type="number" min="0" step="0.01" value={form.cost_price} onChange={set('cost_price')} required />
            </div>
            <div className="form-group">
              <label>Selling Price (₦) *</label>
              <input className="form-control" type="number" min="0" step="0.01" value={form.selling_price} onChange={set('selling_price')} required />
            </div>
            <div className="form-group">
              <label>Opening Stock</label>
              <input className="form-control" type="number" min="0" value={form.stock_quantity} onChange={set('stock_quantity')} />
            </div>
            <div className="form-group">
              <label>Reorder Level</label>
              <input className="form-control" type="number" min="0" value={form.reorder_level} onChange={set('reorder_level')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (isEdit ? 'Update' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustModal({ product, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ change_type: 'stock-in', quantity_changed: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const qty = form.change_type === 'stock-out'
        ? -Math.abs(parseInt(form.quantity_changed))
        : Math.abs(parseInt(form.quantity_changed));
      await inventoryApi.adjust({ product_id: product.id, change_type: form.change_type, quantity_changed: qty, reason: form.reason });
      toast('Stock adjusted');
      onSaved();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Adjustment failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Adjust Stock — {product.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select className="form-control" value={form.change_type} onChange={e => setForm(f => ({ ...f, change_type: e.target.value }))}>
              <option value="stock-in">Stock In (Purchase/Receive)</option>
              <option value="stock-out">Stock Out (Damage/Theft)</option>
              <option value="adjustment">Manual Adjustment</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input className="form-control" type="number" min="1" value={form.quantity_changed} onChange={e => setForm(f => ({ ...f, quantity_changed: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input className="form-control" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional note" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Apply'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | { type: 'add'|'edit'|'adjust', product? }

  const load = () => {
    setLoading(true);
    productsApi.list().then(setProducts).catch(() => toast('Failed to load products', 'error')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await productsApi.delete(p.id);
      toast('Product deleted');
      load();
    } catch {
      toast('Delete failed', 'error');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').includes(search)
  );

  const stockBadge = (p) => {
    if (p.stock_quantity === 0) return <span className="badge badge-danger">Out</span>;
    if (p.stock_quantity <= p.reorder_level) return <span className="badge badge-warning">Low</span>;
    return <span className="badge badge-success">OK</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage your product catalogue and stock levels</p>
      </div>

      <div className="toolbar">
        <div className="search-bar" style={{ flex: 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-control" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add Product</button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading products…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '2.5rem' }}>📦</span>
          <p>{search ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.barcode && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>#{p.barcode}</div>}
                  </td>
                  <td>{p.category || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{fmt(p.cost_price)}</td>
                  <td style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{fmt(p.selling_price)}</td>
                  <td>{p.stock_quantity} units</td>
                  <td>{stockBadge(p)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'adjust', product: p })}>Adjust</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'edit', product: p })}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.type === 'add' && <ProductModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {modal?.type === 'edit' && <ProductModal product={modal.product} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {modal?.type === 'adjust' && <AdjustModal product={modal.product} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}

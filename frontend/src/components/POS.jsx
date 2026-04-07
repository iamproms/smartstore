import { useState, useEffect } from 'react';
import { productsApi, salesApi } from '../api';
import { useToast } from '../Toast';

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

function ReceiptModal({ sale, items, onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380, fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>SmartStore</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date().toLocaleString()}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Receipt #{sale.id}</div>
        </div>
        <div style={{ borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '12px 0', margin: '12px 0' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '3px 0' }}>
              <span>{item.name} x{item.quantity}</span>
              <span>{fmt(item.price_at_sale * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: 8 }}>
          <span>TOTAL</span><span>{fmt(sale.total_amount)}</span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 16 }}>
          Payment: {sale.payment_method?.toUpperCase()}
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
          Thank you for shopping with us!
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function POS() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    productsApi.list()
      .then(setProducts)
      .catch(() => toast('Failed to load products', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast(`Only ${product.stock_quantity} in stock`, 'error');
          return prev;
        }
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price_at_sale: product.selling_price,
        cost_price: product.cost_price,
        quantity: 1,
        max_qty: product.stock_quantity,
      }];
    });
  };

  const updateQty = (product_id, delta) => {
    setCart(prev => prev
      .map(i => i.product_id === product_id ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((s, i) => s + i.price_at_sale * i.quantity, 0);
  const profit = cart.reduce((s, i) => s + (i.price_at_sale - i.cost_price) * i.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const saleData = {
        payment_method: paymentMethod,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      };
      const sale = await salesApi.create(saleData);
      const receiptItems = cart.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price_at_sale: i.price_at_sale,
      }));
      // Refresh products list for updated stock
      productsApi.list().then(setProducts);
      setReceipt({ sale, items: receiptItems });
      setCart([]);
      toast(`Sale of ${fmt(sale.total_amount)} completed!`);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg || JSON.stringify(d)).join('; ')
        : (typeof detail === 'string' ? detail : 'Checkout failed');
      toast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>Point of Sale</h2>
        <p>Select products to add to cart, then checkout</p>
      </div>

      <div className="pos-layout">
        {/* Product Grid */}
        <div className="pos-products">
          <div className="toolbar" style={{ marginBottom: 16 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="form-control" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
          </div>
          {loading ? (
            <div className="empty-state"><p>Loading products…</p></div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  className={`product-tile ${p.stock_quantity === 0 ? 'out-of-stock' : ''}`}
                  onClick={() => addToCart(p)}
                >
                  <div className="pt-name">{p.name}</div>
                  {p.category && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{p.category}</div>}
                  <div className="pt-price">{fmt(p.selling_price)}</div>
                  <div className="pt-stock">{p.stock_quantity} in stock</div>
                </button>
              ))}
              {filteredProducts.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><p>No products found.</p></div>}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="cart-panel">
          <div className="cart-header">
            <h3>🛒 Cart ({cart.length})</h3>
            {cart.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear</button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <span style={{ fontSize: '2rem' }}>🛒</span>
                <p>Tap products to add them</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product_id} className="cart-item">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, -1)}>−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, 1)} disabled={item.quantity >= item.max_qty}>+</button>
                  </div>
                  <div className="cart-item-total">{fmt(item.price_at_sale * item.quantity)}</div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>{fmt(total)}</span></div>
              <div className="summary-row"><span>Est. Profit</span><span style={{ color: 'var(--success)' }}>{fmt(profit)}</span></div>
              <div className="summary-row total"><span>TOTAL</span><span>{fmt(total)}</span></div>
            </div>

            <div className="payment-methods">
              {['cash', 'transfer', 'pos'].map(m => (
                <button key={m} className={`pm-btn ${paymentMethod === m ? 'active' : ''}`} onClick={() => setPaymentMethod(m)}>
                  {m === 'cash' ? '💵 Cash' : m === 'transfer' ? '🏦 Transfer' : '💳 POS'}
                </button>
              ))}
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '12px' }}
              disabled={cart.length === 0 || processing}
              onClick={handleCheckout}
            >
              {processing ? 'Processing…' : `Checkout ${fmt(total)}`}
            </button>
          </div>
        </div>
      </div>

      {receipt && (
        <ReceiptModal sale={receipt.sale} items={receipt.items} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

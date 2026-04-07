import { useState, useEffect } from 'react';
import { statsApi } from '../api';

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.daily()
      .then(setStats)
      .catch(() => setStats({ total_sales: 0, total_profit: 0, transaction_count: 0, low_stock_count: 0, low_stock_products: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading dashboard…</p></div>;

  const statCards = [
    { label: "Today's Sales", value: fmt(stats.total_sales), icon: '💰', color: '#6366f1' },
    { label: "Today's Profit", value: fmt(stats.total_profit), icon: '📈', color: '#10b981' },
    { label: 'Transactions', value: stats.transaction_count, icon: '🧾', color: '#3b82f6' },
    { label: 'Low Stock Items', value: stats.low_stock_count, icon: '⚠️', color: '#f59e0b' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of today's store performance</p>
      </div>

      <div className="stat-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="value">{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '0.95rem', fontWeight: 700 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => onNavigate('pos')}>🛒 New Sale (POS)</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('products')}>📦 Manage Products</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('inventory')}>📋 View Inventory Logs</button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '0.95rem', fontWeight: 700 }}>⚠️ Low Stock Alerts</h3>
          {stats.low_stock_products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All products are sufficiently stocked.</p>
          ) : (
            <div className="alert-list">
              {stats.low_stock_products.slice(0, 6).map(p => (
                <div className="alert-item" key={p.id}>
                  <div>
                    <div className="alert-item-label">{p.name}</div>
                    <div className="alert-item-sub">{p.stock} units remaining</div>
                  </div>
                  <span className="badge badge-warning">Low</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

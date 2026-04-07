import { useState, useEffect } from 'react';
import { inventoryApi } from '../api';
import { useToast } from '../Toast';

const changeTypeLabel = {
  'stock-in': { label: 'Stock In', cls: 'badge-success' },
  'stock-out': { label: 'Stock Out', cls: 'badge-danger' },
  'adjustment': { label: 'Adjustment', cls: 'badge-info' },
};

export default function InventoryLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.logs()
      .then(setLogs)
      .catch(() => toast('Failed to load logs', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Inventory Logs</h2>
        <p>Full audit trail of all stock changes</p>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading logs…</p></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '2.5rem' }}>📋</span>
          <p>No inventory changes recorded yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Product ID</th>
                <th>Type</th>
                <th>Qty Changed</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const meta = changeTypeLabel[log.change_type] || { label: log.change_type, cls: 'badge-muted' };
                return (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>#{log.product_id}</td>
                    <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                    <td style={{ fontWeight: 700, color: log.quantity_changed > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.reason || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

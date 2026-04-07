import { useState } from 'react';
import { ToastProvider } from './Toast';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import POS from './components/POS';
import InventoryLogs from './components/InventoryLogs';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'pos',       label: 'Point of Sale', icon: '🛒' },
  { id: 'products',  label: 'Products', icon: '📦' },
  { id: 'inventory', label: 'Inventory Logs', icon: '📋' },
];

function AppContent() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'pos':       return <POS />;
      case 'products':  return <Products />;
      case 'inventory': return <InventoryLogs />;
      default:          return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>SmartStore</h1>
          <span>Inventory &amp; POS System</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-btn ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            SmartStore MVP v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

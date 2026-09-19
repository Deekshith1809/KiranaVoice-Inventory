import React from 'react';
import { LayoutDashboard, Package, BookOpen, Camera, HelpCircle, History, Bell, Settings } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Navigation = ({ activeTab, setActiveTab }) => {
  const { products, customers, callbackRequests, settings } = useInventory();
  
  const lowStockCount = products.filter(p => p.quantity <= p.reorderLevel).length;
  
  const overdueCount = customers.filter(c => {
    if (c.currentBalance <= 0) return false;
    const createdDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return createdDays >= (settings.overdueDaysThreshold || 30);
  }).length;

  const pendingSupportCount = callbackRequests.filter(r => r.status === 'Pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'khata', label: 'Khata Book', icon: BookOpen, badge: overdueCount },
    { id: 'scan', label: 'Scan', icon: Camera },
    { id: 'support', label: 'Support', icon: HelpCircle, badge: pendingSupportCount },
    { id: 'transactions', label: 'Ledger', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: lowStockCount },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="main-navigation">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="icon-wrapper">
              <Icon size={18} />
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}

      <style>{`
        .main-navigation {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.5rem 0.2rem;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          background: transparent;
          color: #64748b;
          padding: 0.3rem 0.3rem;
          border-radius: 10px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 46px;
        }

        .nav-item:hover {
          color: #94a3b8;
        }

        .nav-item.active {
          color: #6366f1;
          background: rgba(99, 102, 241, 0.12);
        }

        .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0f172a;
        }

        .nav-label {
          font-size: 0.68rem;
          font-weight: 500;
          white-space: nowrap;
        }

        @media (min-width: 768px) {
          .main-navigation {
            position: sticky;
            top: 70px;
            bottom: auto;
            flex-direction: row;
            justify-content: center;
            gap: 0.5rem;
            background: transparent;
            border-top: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.75rem 1.5rem;
          }

          .nav-item {
            flex-direction: row;
            gap: 0.35rem;
            padding: 0.45rem 0.85rem;
            border-radius: 9999px;
          }

          .nav-label {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </nav>
  );
};

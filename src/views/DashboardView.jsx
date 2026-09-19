import React from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  XCircle, 
  IndianRupee, 
  Mic, 
  Plus, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';

export const DashboardView = ({ onOpenVoice, onOpenAddProduct, onNavigate }) => {
  const { products, transactions } = useInventory();
  const { t } = useTranslation();

  // Metrics
  const totalProducts = products.length;
  const totalStockItems = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel);
  const outOfStockItems = products.filter(p => p.quantity === 0);
  const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Prominent Voice Assistant Hero Banner */}
      <div className="voice-hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <Mic size={14} />
            <span>{t('voiceFirstTag')}</span>
          </div>
          <h2>{t('speakInstruction')}</h2>
          <p>{t('listeningPrompt')}</p>
          <div className="hero-sample">
            <span>{t('trySaying')}</span> <strong>"Rice 20 bags vachayi"</strong> or <strong>"Add 10 kg Sugar"</strong>
          </div>
        </div>

        <button className="hero-mic-trigger" onClick={onOpenVoice}>
          <div className="mic-outer-ring"></div>
          <Mic size={32} />
          <span>{t('speakStock')}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{t('totalProducts')}</span>
            <div className="kpi-icon-wrapper indigo">
              <Package size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalProducts}</div>
          <div className="kpi-footer">{t('activeCatalogItems')}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{t('totalStockCount')}</span>
            <div className="kpi-icon-wrapper cyan">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalStockItems.toLocaleString()}</div>
          <div className="kpi-footer">{t('acrossTradeUnits')}</div>
        </div>

        <div className="kpi-card clickable" onClick={() => onNavigate('alerts')}>
          <div className="kpi-header">
            <span className="kpi-title">{t('lowStockItems')}</span>
            <div className="kpi-icon-wrapper amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value amber">{lowStockItems.length}</div>
          <div className="kpi-footer amber-text">{t('requiresReorderAction')}</div>
        </div>

        <div className="kpi-card clickable" onClick={() => onNavigate('alerts')}>
          <div className="kpi-header">
            <span className="kpi-title">{t('outOfStockItems')}</span>
            <div className="kpi-icon-wrapper crimson">
              <XCircle size={18} />
            </div>
          </div>
          <div className="kpi-value crimson">{outOfStockItems.length}</div>
          <div className="kpi-footer crimson-text">{t('zeroQuantityAvailable')}</div>
        </div>

        <div className="kpi-card col-span-2">
          <div className="kpi-header">
            <span className="kpi-title">{t('totalStockValue')}</span>
            <div className="kpi-icon-wrapper emerald">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value emerald">₹ {totalValue.toLocaleString('en-IN')}</div>
          <div className="kpi-footer">{t('basedOnRetailPrices')}</div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="quick-actions-bar">
        <button className="action-btn primary" onClick={onOpenVoice}>
          <Mic size={18} />
          <span>{t('speakStock')}</span>
        </button>

        <button className="action-btn secondary" onClick={onOpenAddProduct}>
          <Plus size={18} />
          <span>{t('addNewProduct')}</span>
        </button>

        <button className="action-btn tertiary" onClick={() => onNavigate('inventory')}>
          <Package size={18} />
          <span>{t('viewAllInventory')} ({totalProducts})</span>
        </button>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h3>{t('recentActivity')}</h3>
            <p>Latest inward and outward updates</p>
          </div>
          <button className="view-all-btn" onClick={() => onNavigate('transactions')}>
            <span>{t('transactions')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="transaction-feed">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="feed-item">
              <div className={`type-badge ${tx.type}`}>
                {tx.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>

              <div className="feed-info">
                <span className="feed-product">{tx.productName}</span>
                <span className="feed-time">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="feed-details">
                <span className={`feed-qty ${tx.type}`}>
                  {tx.type === 'IN' ? '+' : '-'}{tx.quantity} {tx.unit}
                </span>
                <span className={`source-tag ${tx.source}`}>
                  {tx.source === 'VOICE' ? `🎤 ${t('voice')}` : `📝 ${t('manual')}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .voice-hero-banner {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          padding: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.2);
          position: relative;
          overflow: hidden;
        }

        .voice-hero-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .hero-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.35rem;
        }

        .hero-content p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .hero-sample {
          font-size: 0.8rem;
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.6);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          display: inline-block;
        }

        .hero-sample strong {
          color: #38bdf8;
        }

        .hero-mic-trigger {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: white;
          padding: 1.25rem;
          border-radius: 20px;
          min-width: 140px;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .hero-mic-trigger:hover {
          transform: scale(1.05);
          box-shadow: 0 0 35px rgba(239, 68, 68, 0.7);
        }

        .mic-outer-ring {
          position: absolute;
          inset: -4px;
          border-radius: 24px;
          border: 2px solid rgba(239, 68, 68, 0.5);
          animation: pulseGlow 2s infinite;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .kpi-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.2s;
        }

        .kpi-card.clickable:hover {
          transform: translateY(-2px);
          cursor: pointer;
          border-color: rgba(99, 102, 241, 0.4);
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .kpi-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon-wrapper.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .kpi-icon-wrapper.cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
        .kpi-icon-wrapper.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .kpi-icon-wrapper.crimson { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .kpi-icon-wrapper.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .kpi-value.amber { color: #fbbf24; }
        .kpi-value.crimson { color: #f87171; }
        .kpi-value.emerald { color: #34d399; }

        .kpi-footer {
          font-size: 0.75rem;
          color: #64748b;
        }

        .amber-text { color: #f59e0b; }
        .crimson-text { color: #ef4444; }

        .quick-actions-bar {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          min-width: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1.25rem;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .action-btn.secondary {
          background: rgba(30, 41, 59, 0.9);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .action-btn.tertiary {
          background: rgba(15, 23, 42, 0.6);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .dashboard-section {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.25rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .section-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .section-header p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          color: #818cf8;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .transaction-feed {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feed-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.5);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .type-badge {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .type-badge.IN { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .type-badge.OUT { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .feed-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          margin-left: 0.85rem;
        }

        .feed-product {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .feed-time {
          font-size: 0.75rem;
          color: #64748b;
        }

        .feed-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.15rem;
        }

        .feed-qty {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .feed-qty.IN { color: #34d399; }
        .feed-qty.OUT { color: #f87171; }

        .source-tag {
          font-size: 0.7rem;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .source-tag.VOICE { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .source-tag.MANUAL { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }

        @media (max-width: 768px) {
          .voice-hero-banner {
            flex-direction: column;
            text-align: center;
          }
          .col-span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
};

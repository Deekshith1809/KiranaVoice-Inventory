import React, { useState } from 'react';
import { AlertTriangle, XCircle, ShoppingBag, Plus, Check, RefreshCw } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';

export const AlertsView = ({ onOpenVoice }) => {
  const { products, addStock } = useInventory();
  const { t } = useTranslation();

  const [reorderModalItem, setReorderModalItem] = useState(null);
  const [reorderQty, setReorderQty] = useState('20');
  const [successMessage, setSuccessMessage] = useState('');

  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel);
  const outOfStockItems = products.filter(p => p.quantity === 0);
  const allAlertItems = [...outOfStockItems, ...lowStockItems];

  const handleExecuteReorder = (e) => {
    e.preventDefault();
    if (!reorderModalItem || !reorderQty) return;

    const qtyNum = Number(reorderQty);
    const res = addStock(reorderModalItem.id, qtyNum, reorderModalItem.unit, 'MANUAL');
    if (res.success) {
      setSuccessMessage(`Successfully added ${qtyNum} ${reorderModalItem.unit} of ${reorderModalItem.name}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setReorderModalItem(null);
  };

  return (
    <div className="alerts-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>{t('alertsTitle')}</h2>
          <p>{t('alertsSubtitle')}</p>
        </div>
      </div>

      {successMessage && (
        <div className="success-banner animate-fade-in">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Overview Metric Boxes */}
      <div className="alert-metrics-grid">
        <div className="metric-box out">
          <div className="box-icon">
            <XCircle size={24} />
          </div>
          <div>
            <span className="box-count">{outOfStockItems.length}</span>
            <span className="box-label">{t('outOfStockItems')}</span>
          </div>
        </div>

        <div className="metric-box low">
          <div className="box-icon">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="box-count">{lowStockItems.length}</span>
            <span className="box-label">{t('lowStockItems')}</span>
          </div>
        </div>

        <div className="metric-box total">
          <div className="box-icon">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="box-count">{allAlertItems.length}</span>
            <span className="box-label">Total Reorder Required</span>
          </div>
        </div>
      </div>

      {/* Alert Items List */}
      <div className="alerts-list">
        <h3>Items Requiring Reorder ({allAlertItems.length})</h3>

        {allAlertItems.length === 0 ? (
          <div className="all-good-box">
            <Check size={48} className="check-hero" />
            <h4>All Inventory Items Well Stocked!</h4>
            <p>No products are currently low or out of stock.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {allAlertItems.map(item => {
              const isOut = item.quantity === 0;
              const missingToReorder = Math.max(0, (item.reorderLevel * 2) - item.quantity);

              return (
                <div key={item.id} className={`alert-card ${isOut ? 'out-of-stock' : 'low-stock'}`}>
                  <div className="card-top">
                    <span className={`status-pill ${isOut ? 'OUT' : 'LOW'}`}>
                      {isOut ? <XCircle size={14} /> : <AlertTriangle size={14} />}
                      <span>{isOut ? 'Out of Stock' : 'Low Stock'}</span>
                    </span>

                    <span className="category-tag">{item.category}</span>
                  </div>

                  <h4 className="item-title">{item.name}</h4>

                  <div className="stock-info-row">
                    <div className="info-stat">
                      <span className="info-label">Current Quantity</span>
                      <span className="info-val">{item.quantity} {item.unit}</span>
                    </div>

                    <div className="info-stat">
                      <span className="info-label">Reorder Level</span>
                      <span className="info-val">{item.reorderLevel} {item.unit}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="reorder-action-btn"
                      onClick={() => {
                        setReorderModalItem(item);
                        setReorderQty(String(missingToReorder > 0 ? missingToReorder : 20));
                      }}
                    >
                      <Plus size={16} />
                      <span>1-Tap Reorder Stock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fast Reorder Modal */}
      {reorderModalItem && (
        <div className="modal-overlay animate-fade-in">
          <div className="reorder-modal-content animate-slide-up">
            <h3>Top Up Stock: {reorderModalItem.name}</h3>
            <p>Current: {reorderModalItem.quantity} {reorderModalItem.unit} | Threshold: {reorderModalItem.reorderLevel} {reorderModalItem.unit}</p>

            <form onSubmit={handleExecuteReorder} className="reorder-form">
              <label>Select or Type Quantity to Add ({reorderModalItem.unit}):</label>
              
              <div className="quick-qty-chips">
                <button type="button" onClick={() => setReorderQty('10')}>+10 {reorderModalItem.unit}</button>
                <button type="button" onClick={() => setReorderQty('20')}>+20 {reorderModalItem.unit}</button>
                <button type="button" onClick={() => setReorderQty('50')}>+50 {reorderModalItem.unit}</button>
                <button type="button" onClick={() => setReorderQty('100')}>+100 {reorderModalItem.unit}</button>
              </div>

              <input
                type="number"
                min="1"
                required
                value={reorderQty}
                onChange={e => setReorderQty(e.target.value)}
              />

              <div className="modal-btns">
                <button type="submit" className="confirm-reorder-btn">
                  <Check size={16} />
                  <span>Add Stock Now</span>
                </button>
                <button type="button" className="cancel-reorder-btn" onClick={() => setReorderModalItem(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .alerts-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .view-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .view-header p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .alert-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .metric-box {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .box-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-box.out .box-icon { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .metric-box.low .box-icon { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .metric-box.total .box-icon { background: rgba(99, 102, 241, 0.15); color: #818cf8; }

        .box-count {
          font-size: 1.6rem;
          font-weight: 700;
          color: #f8fafc;
          display: block;
          line-height: 1.1;
        }

        .box-label {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .alerts-list h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 1rem;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .alert-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .alert-card.out-of-stock {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.05);
        }

        .alert-card.low-stock {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.05);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-pill.OUT { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .status-pill.LOW { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

        .category-tag {
          font-size: 0.75rem;
          color: #64748b;
        }

        .item-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .stock-info-row {
          display: flex;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.5);
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
        }

        .info-stat {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .info-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .info-val {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .reorder-action-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #6366f1;
          color: white;
          padding: 0.65rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .all-good-box {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          color: #34d399;
        }

        .check-hero {
          margin-bottom: 0.75rem;
        }

        .reorder-modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          padding: 1.5rem;
        }

        .reorder-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1rem;
        }

        .quick-qty-chips {
          display: flex;
          gap: 0.5rem;
        }

        .quick-qty-chips button {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.4rem 0.65rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .modal-btns {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .confirm-reorder-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #10b981;
          color: white;
          padding: 0.65rem;
          border-radius: 10px;
          font-weight: 600;
        }

        .cancel-reorder-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.65rem 1rem;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

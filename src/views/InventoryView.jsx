import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Mic,
  History,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';

export const InventoryView = ({ onOpenAddProduct, onOpenVoice, onEditProduct }) => {
  const { products, transactions, addStock, removeStock, deleteProduct, getStockStatus } = useInventory();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' or 'HISTORY'
  const [errorMessage, setErrorMessage] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEditCaution, setProductToEditCaution] = useState(null);

  // Quick Inline Adjustments
  const handleQuickAdd = async (product) => {
    setErrorMessage(null);
    const res = await addStock(product.id, 1, product.unit, 'MANUAL');
    if (!res.success) setErrorMessage(res.message);
  };

  const handleQuickRemove = async (product) => {
    setErrorMessage(null);
    const res = await removeStock(product.id, 1, product.unit, 'MANUAL');
    if (!res.success) {
      setErrorMessage(res.message || `Insufficient stock. Available: ${product.quantity} ${product.unit}, Requested: 1 ${product.unit}.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getStockStatus(p.quantity, p.reorderLevel).code;
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'LOW_STOCK') return matchesSearch && status === 'LOW_STOCK';
    if (statusFilter === 'OUT_OF_STOCK') return matchesSearch && status === 'OUT_OF_STOCK';
    if (statusFilter === 'IN_STOCK') return matchesSearch && status === 'IN_STOCK';
    return matchesSearch;
  });

  return (
    <div className="inventory-container animate-fade-in">
      {/* Insufficient Stock Error Banner */}
      {errorMessage && (
        <div className="error-banner animate-slide-down">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="inventory-header">
        <div>
          <h2>{t('inventoryCatalog')}</h2>
          <p>{t('manageStockItems')}</p>
        </div>

        <div className="header-btns">
          <div className="tab-switch">
            <button 
              className={`tab-btn ${activeTab === 'CATALOG' ? 'active' : ''}`}
              onClick={() => setActiveTab('CATALOG')}
            >
              <Package size={16} />
              <span>Catalog</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
              onClick={() => setActiveTab('HISTORY')}
            >
              <History size={16} />
              <span>{t('transactions')} ({transactions.length})</span>
            </button>
          </div>

          <button className="voice-btn" onClick={onOpenVoice}>
            <Mic size={18} />
            <span>{t('speakStock')}</span>
          </button>

          <button className="add-btn" onClick={onOpenAddProduct}>
            <Plus size={18} />
            <span>{t('addNewProduct')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'CATALOG' ? (
        <>
          {/* Toolbar Search & Status Filters */}
          <div className="toolbar-section">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
              )}
            </div>

            <div className="filter-chips">
              <button 
                className={`filter-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                {t('all')} ({products.length})
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'LOW_STOCK' ? 'active amber' : ''}`}
                onClick={() => setStatusFilter('LOW_STOCK')}
              >
                <AlertTriangle size={14} />
                {t('lowStock')} ({products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel).length})
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'OUT_OF_STOCK' ? 'active crimson' : ''}`}
                onClick={() => setStatusFilter('OUT_OF_STOCK')}
              >
                <XCircle size={14} />
                {t('outOfStock')} ({products.filter(p => p.quantity === 0).length})
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'IN_STOCK' ? 'active emerald' : ''}`}
                onClick={() => setStatusFilter('IN_STOCK')}
              >
                <CheckCircle2 size={14} />
                {t('healthyStock')} ({products.filter(p => p.quantity > p.reorderLevel).length})
              </button>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>{t('productName')}</th>
                  <th>{t('quantity')}</th>
                  <th>{t('unitPrice')}</th>
                  <th>{t('stockValue')}</th>
                  <th>{t('status')}</th>
                  <th>{t('fastAdjust')}</th>
                  <th className="text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <Package size={36} className="empty-icon" />
                      <p>No inventory items match your search or filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => {
                    const status = getStockStatus(prod.quantity, prod.reorderLevel);
                    const stockVal = prod.stockValue || (prod.quantity * prod.price);

                    return (
                      <tr key={prod.id}>
                        <td>
                          <div className="prod-name-box">
                            <span className="prod-name">{prod.name}</span>
                            <span className="prod-cat">{prod.category}</span>
                          </div>
                        </td>

                        <td>
                          <div className="qty-box">
                            <span className="qty-number">{prod.quantity}</span>
                            <span className="unit-label">{prod.unit}</span>
                          </div>
                          <span className="reorder-info">Reorder at: {prod.reorderLevel} {prod.unit}</span>
                        </td>

                        <td>
                          <span className="price-tag">₹ {prod.price.toLocaleString('en-IN')}</span>
                        </td>

                        <td>
                          <span className="stock-value-tag">₹ {stockVal.toLocaleString('en-IN')}</span>
                        </td>

                        <td>
                          <span className={`status-badge ${status.code}`}>
                            {status.code === 'IN_STOCK' && <CheckCircle2 size={14} />}
                            {status.code === 'LOW_STOCK' && <AlertTriangle size={14} />}
                            {status.code === 'OUT_OF_STOCK' && <XCircle size={14} />}
                            <span>{status.label}</span>
                          </span>
                        </td>

                        <td>
                          <div className="adjust-buttons">
                            <button 
                              className="adjust-btn minus"
                              onClick={() => handleQuickRemove(prod)}
                              title="Deduct 1 unit"
                            >
                              <Minus size={14} />
                            </button>
                            <button 
                              className="adjust-btn plus"
                              onClick={() => handleQuickAdd(prod)}
                              title="Add 1 unit"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        <td className="text-right">
                          <div className="row-actions">
                            <button 
                              className="icon-action-btn"
                              onClick={() => setProductToEditCaution(prod)}
                              title="Edit Details"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="icon-action-btn delete"
                              onClick={() => setProductToDelete(prod)}
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
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
        </>
      ) : (
        /* Inventory Transaction History Table */
        <div className="table-wrapper animate-fade-in">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <History size={36} className="empty-icon" />
                    <p>No inventory transactions recorded yet.</p>
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id || Math.random()}>
                    <td>{new Date(tx.createdAt || Date.now()).toLocaleString('en-IN')}</td>
                    <td><strong style={{ color: '#f8fafc' }}>{tx.productName || tx.product}</strong></td>
                    <td>
                      <span className={`tx-type-badge ${tx.type}`}>
                        {tx.type === 'IN' ? '+ Stock IN' : '- Stock OUT'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: tx.type === 'IN' ? '#34d399' : '#f87171' }}>
                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity} {tx.unit}
                      </span>
                    </td>
                    <td>₹ {(tx.price || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="source-tag">{tx.source || 'MANUAL'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay animate-fade-in">
          <div className="delete-modal-content animate-scale-up">
            <AlertTriangle size={36} className="danger-icon" />
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete <strong>{productToDelete.name}</strong>?</p>
            <p className="sub-text">This product will be archived and historical transactions preserved.</p>

            <div className="modal-actions">
              <button className="confirm-delete-btn" onClick={handleConfirmDelete}>
                Yes, Delete Product
              </button>
              <button className="cancel-btn" onClick={() => setProductToDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Change Caution Modal prior to editing */}
      {productToEditCaution && (
        <div className="modal-overlay animate-fade-in">
          <div className="delete-modal-content animate-scale-up">
            <AlertCircle size={36} style={{ color: '#6366f1' }} />
            <h3>Edit Product Details</h3>
            <p>You are about to edit <strong>{productToEditCaution.name}</strong>.</p>
            <p className="sub-text">⚠️ Caution: Changing the trade unit will not silently recalculate historical stock quantities.</p>

            <div className="modal-actions">
              <button className="confirm-delete-btn" style={{ background: '#6366f1' }} onClick={() => {
                const prod = productToEditCaution;
                setProductToEditCaution(null);
                onEditProduct(prod);
              }}>
                Proceed to Edit
              </button>
              <button className="cancel-btn" onClick={() => setProductToEditCaution(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .inventory-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 0.85rem 1.25rem;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.88rem;
        }

        .error-banner button {
          margin-left: auto;
          background: transparent;
          color: #fca5a5;
          font-size: 1.25rem;
        }

        .inventory-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .inventory-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .inventory-header p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .header-btns {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tab-switch {
          display: flex;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 3px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          border-radius: 9px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .tab-btn.active {
          background: #6366f1;
          color: white;
        }

        .voice-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: white;
          padding: 0.6rem 1.1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #6366f1;
          color: white;
          padding: 0.6rem 1.1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .toolbar-section {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-wrapper input {
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          border-radius: 14px;
          font-size: 0.9rem;
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          color: #94a3b8;
          font-size: 1.2rem;
        }

        .filter-chips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .filter-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(30, 41, 59, 0.6);
          color: #94a3b8;
          padding: 0.4rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.08);
          white-space: nowrap;
        }

        .filter-chip.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .filter-chip.active.amber { background: #f59e0b; border-color: #f59e0b; color: #0f172a; }
        .filter-chip.active.crimson { background: #ef4444; border-color: #ef4444; color: white; }
        .filter-chip.active.emerald { background: #10b981; border-color: #10b981; color: white; }

        .table-wrapper {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .inventory-table th {
          background: rgba(15, 23, 42, 0.6);
          padding: 0.85rem 1.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .inventory-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .prod-name-box {
          display: flex;
          flex-direction: column;
        }

        .prod-name {
          font-weight: 700;
          color: #f8fafc;
        }

        .prod-cat {
          font-size: 0.75rem;
          color: #64748b;
        }

        .qty-box {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
        }

        .qty-number {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .unit-label {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .reorder-info {
          font-size: 0.7rem;
          color: #64748b;
          display: block;
        }

        .price-tag {
          font-weight: 600;
          color: #34d399;
        }

        .stock-value-tag {
          font-weight: 700;
          color: #fbbf24;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-badge.IN_STOCK { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .status-badge.LOW_STOCK { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .status-badge.OUT_OF_STOCK { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .adjust-buttons {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .adjust-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: background 0.2s;
        }

        .adjust-btn.plus { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .adjust-btn.minus { background: rgba(239, 68, 68, 0.2); color: #f87171; }

        .tx-type-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .tx-type-badge.IN { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .tx-type-badge.OUT { background: rgba(239, 68, 68, 0.2); color: #f87171; }

        .source-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
        }

        .text-right { text-align: right; }

        .row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .icon-action-btn {
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-action-btn.delete:hover { color: #f87171; background: rgba(239, 68, 68, 0.15); }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem !important;
          color: #64748b;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .delete-modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          padding: 1.75rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .danger-icon { color: #ef4444; }

        .delete-modal-content h3 {
          font-size: 1.2rem;
          color: #f8fafc;
        }

        .delete-modal-content p {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .sub-text {
          font-size: 0.78rem !important;
          color: #94a3b8 !important;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          width: 100%;
          margin-top: 0.5rem;
        }

        .confirm-delete-btn {
          flex: 1;
          background: #ef4444;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  IndianRupee,
  Mic
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const InventoryView = ({ onOpenAddProduct, onOpenVoice, onEditProduct }) => {
  const { products, addStock, removeStock, deleteProduct, getStockStatus } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fast inline stock update
  const handleQuickAdd = (product) => {
    addStock(product.id, 1, product.unit, 'MANUAL');
  };

  const handleQuickRemove = (product) => {
    removeStock(product.id, 1, product.unit, 'MANUAL');
  };

  // Filter products
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
      {/* Header & Controls */}
      <div className="inventory-header">
        <div>
          <h2>Inventory Catalog</h2>
          <p>Track, adjust, and reorder shop items</p>
        </div>

        <div className="header-btns">
          <button className="voice-btn" onClick={onOpenVoice}>
            <Mic size={18} />
            <span>Voice Update</span>
          </button>

          <button className="add-btn" onClick={onOpenAddProduct}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="toolbar-section">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search product name or category..."
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
            All ({products.length})
          </button>
          <button 
            className={`filter-chip ${statusFilter === 'LOW_STOCK' ? 'active amber' : ''}`}
            onClick={() => setStatusFilter('LOW_STOCK')}
          >
            <AlertTriangle size={14} />
            Low Stock ({products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel).length})
          </button>
          <button 
            className={`filter-chip ${statusFilter === 'OUT_OF_STOCK' ? 'active crimson' : ''}`}
            onClick={() => setStatusFilter('OUT_OF_STOCK')}
          >
            <XCircle size={14} />
            Out of Stock ({products.filter(p => p.quantity === 0).length})
          </button>
          <button 
            className={`filter-chip ${statusFilter === 'IN_STOCK' ? 'active emerald' : ''}`}
            onClick={() => setStatusFilter('IN_STOCK')}
          >
            <CheckCircle2 size={14} />
            In Stock ({products.filter(p => p.quantity > p.reorderLevel).length})
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product & Category</th>
              <th>Quantity & Unit</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th>Fast Adjust</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <Package size={36} className="empty-icon" />
                  <p>No inventory items match your search or filter.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(prod => {
                const status = getStockStatus(prod.quantity, prod.reorderLevel);
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
                          disabled={prod.quantity <= 0}
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
                          onClick={() => onEditProduct(prod)}
                          title="Edit Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="icon-action-btn delete"
                          onClick={() => {
                            if (window.confirm(`Delete ${prod.name} from catalog?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
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

      <style>{`
        .inventory-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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
        .adjust-btn:disabled { opacity: 0.3; cursor: not-allowed; }

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

        .empty-icon {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

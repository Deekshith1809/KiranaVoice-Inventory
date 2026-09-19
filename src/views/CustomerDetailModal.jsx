import React, { useState } from 'react';
import { X, User, Phone, IndianRupee, Plus, Minus, FileText, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { printKhataPDF } from '../services/khataService';

export const CustomerDetailModal = ({ customer, isOpen, onClose, onAddCredit, onRecordPayment }) => {
  const { khataTransactions } = useInventory();

  const [dateFilter, setDateFilter] = useState('ALL');

  if (!isOpen || !customer) return null;

  const customerTxs = khataTransactions.filter(t => t.customerId === customer.id);

  // Filter transactions
  const filteredTxs = customerTxs.filter(t => {
    if (dateFilter === 'ALL') return true;
    const txDate = new Date(t.createdAt);
    const now = new Date();
    if (dateFilter === '7DAYS') return (now - txDate) <= 1000 * 60 * 60 * 24 * 7;
    if (dateFilter === '30DAYS') return (now - txDate) <= 1000 * 60 * 60 * 24 * 30;
    return true;
  });

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Customer Header */}
        <div className="cust-detail-header">
          <div className="cust-avatar">
            <User size={28} />
          </div>

          <div className="cust-meta">
            <h2>{customer.name}</h2>
            <p><Phone size={14} /> {customer.phone || 'No Phone Registered'}</p>
          </div>

          <div className="cust-balance-box">
            <span className="balance-label">Outstanding Balance</span>
            <span className={`balance-value ${customer.currentBalance > 0 ? 'due' : 'settled'}`}>
              ₹{customer.currentBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="cust-actions-bar">
          <button className="action-btn credit" onClick={() => onAddCredit(customer)}>
            <Plus size={16} />
            <span>Record Udhaar (+Credit)</span>
          </button>

          <button className="action-btn payment" onClick={() => onRecordPayment(customer)}>
            <Minus size={16} />
            <span>Record Payment (-Received)</span>
          </button>

          <button className="action-btn pdf" onClick={() => printKhataPDF(customer, khataTransactions)}>
            <FileText size={16} />
            <span>Export Khata PDF</span>
          </button>
        </div>

        {/* Filter & History Ledger */}
        <div className="ledger-section">
          <div className="section-header">
            <h3>Transaction History</h3>
            
            <div className="date-filter">
              <Calendar size={14} />
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="ALL">All Time</option>
                <option value="7DAYS">Last 7 Days</option>
                <option value="30DAYS">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="history-list">
            {filteredTxs.length === 0 ? (
              <p className="no-tx">No transaction history entries for this period.</p>
            ) : (
              filteredTxs.map(t => (
                <div key={t.id} className="tx-card">
                  <div className={`tx-icon ${t.type}`}>
                    {t.type === 'CREDIT_GIVEN' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>

                  <div className="tx-main">
                    <span className="tx-type">
                      {t.type === 'CREDIT_GIVEN' ? 'Udhaar Given' : 'Payment Received'}
                    </span>
                    <span className="tx-notes">{t.notes || 'No description notes'}</span>
                    <span className="tx-date">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="tx-amount-col">
                    <span className={`tx-amount ${t.type}`}>
                      {t.type === 'CREDIT_GIVEN' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="running-bal">Running: ₹{t.balanceAfter.toLocaleString('en-IN')}</span>
                    <span className={`source-tag ${t.source}`}>
                      {t.source === 'VOICE' ? '🎤 Voice' : '📝 Manual'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
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

        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 1.75rem;
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cust-detail-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .cust-avatar {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cust-meta {
          flex: 1;
        }

        .cust-meta h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .cust-meta p {
          font-size: 0.8rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .cust-balance-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .balance-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .balance-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .balance-value.due { color: #f87171; }
        .balance-value.settled { color: #34d399; }

        .cust-actions-bar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .action-btn.credit { background: #ef4444; color: white; }
        .action-btn.payment { background: #10b981; color: white; }
        .action-btn.pdf { background: #6366f1; color: white; }

        .ledger-section {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .section-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .date-filter {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(30, 41, 59, 0.8);
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .date-filter select {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.75rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tx-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.7);
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .tx-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tx-icon.CREDIT_GIVEN { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .tx-icon.PAYMENT_RECEIVED { background: rgba(16, 185, 129, 0.15); color: #34d399; }

        .tx-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 0.75rem;
        }

        .tx-type {
          font-size: 0.85rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .tx-notes {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .tx-date {
          font-size: 0.7rem;
          color: #64748b;
        }

        .tx-amount-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.1rem;
        }

        .tx-amount {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .tx-amount.CREDIT_GIVEN { color: #f87171; }
        .tx-amount.PAYMENT_RECEIVED { color: #34d399; }

        .running-bal {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .source-tag {
          font-size: 0.65rem;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .source-tag.VOICE { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .source-tag.MANUAL { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }

        .no-tx {
          text-align: center;
          color: #64748b;
          font-size: 0.85rem;
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, Filter, Search, Mic, FileText } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';

export const TransactionsView = () => {
  const { transactions } = useInventory();
  const { t } = useTranslation();

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchesSource = sourceFilter === 'ALL' || tx.source === sourceFilter;
    return matchesSearch && matchesType && matchesSource;
  });

  return (
    <div className="transactions-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>{t('ledgerTitle')}</h2>
          <p>{t('ledgerSubtitle')}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-box">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-select">
            <Filter size={14} />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="ALL">{t('all')}</option>
              <option value="IN">Inward (IN)</option>
              <option value="OUT">Outward (OUT)</option>
            </select>
          </div>

          <div className="filter-select">
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
              <option value="ALL">{t('all')}</option>
              <option value="VOICE">🎤 {t('voice')}</option>
              <option value="MANUAL">📝 {t('manual')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="tx-table">
          <thead>
            <tr>
              <th>{t('date')}</th>
              <th>{t('productName')}</th>
              <th>{t('type')}</th>
              <th>{t('quantity')}</th>
              <th>{t('source')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <History size={36} />
                  <p>No transaction history entries recorded.</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div className="date-box">
                      <span className="date-main">
                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="time-sub">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="prod-title">{tx.productName}</span>
                  </td>

                  <td>
                    <span className={`op-badge ${tx.type}`}>
                      {tx.type === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      <span>{tx.type === 'IN' ? 'Inward Stock' : 'Outward Stock'}</span>
                    </span>
                  </td>

                  <td>
                    <span className={`qty-value ${tx.type}`}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity} {tx.unit}
                    </span>
                  </td>

                  <td>
                    <span className={`source-pill ${tx.source}`}>
                      {tx.source === 'VOICE' ? <Mic size={12} /> : <FileText size={12} />}
                      <span>{tx.source === 'VOICE' ? 'Voice Command' : 'Manual Edit'}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .transactions-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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

        .toolbar-box {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: space-between;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 240px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-box input {
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.65rem 1rem 0.65rem 2.4rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
        }

        .filter-select {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.35rem 0.65rem;
          border-radius: 12px;
          color: #94a3b8;
        }

        .filter-select select {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .table-wrapper {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          overflow-x: auto;
        }

        .tx-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .tx-table th {
          background: rgba(15, 23, 42, 0.6);
          padding: 0.85rem 1.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tx-table td {
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          font-size: 0.875rem;
        }

        .date-box {
          display: flex;
          flex-direction: column;
        }

        .date-main {
          font-weight: 600;
          color: #f8fafc;
        }

        .time-sub {
          font-size: 0.75rem;
          color: #64748b;
        }

        .prod-title {
          font-weight: 700;
          color: #f8fafc;
        }

        .op-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .op-badge.IN { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .op-badge.OUT { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .qty-value {
          font-weight: 700;
        }
        .qty-value.IN { color: #34d399; }
        .qty-value.OUT { color: #f87171; }

        .source-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .source-pill.VOICE { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .source-pill.MANUAL { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem !important;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

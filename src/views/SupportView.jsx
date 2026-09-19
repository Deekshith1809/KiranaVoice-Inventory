import React, { useState } from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  Phone, 
  Mail, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Search, 
  Edit3,
  ShieldAlert
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';
import { SUPPORT_PHONE_NUMBER, FAQ_ITEMS } from '../services/supportService';

export const SupportView = ({ onRequestCallback, onEmailSupport }) => {
  const { 
    callbackRequests, 
    supportTickets, 
    updateCallbackStatus, 
    userProfile 
  } = useInventory();
  const { t } = useTranslation();

  const [activeSubTab, setActiveSubTab] = useState('MY_REQUESTS'); // MY_REQUESTS | FAQ | ADMIN_QUEUE
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('ALL');
  const [faqSearch, setFaqSearch] = useState('');

  // Admin Queue Edit State
  const [editingReqId, setEditingReqId] = useState(null);
  const [adminStatus, setAdminStatus] = useState('Pending');
  const [adminAgent, setAdminAgent] = useState('agent-1');
  const [adminNotes, setAdminNotes] = useState('');

  const myRequests = callbackRequests.filter(r => r.shopId === userProfile.shopId);

  const filteredFaqs = FAQ_ITEMS.filter(f => {
    const matchesCat = faqCategoryFilter === 'ALL' || f.category === faqCategoryFilter;
    const matchesSearch = f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          f.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAdminUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingReqId) return;

    updateCallbackStatus(editingReqId, adminStatus, adminAgent, adminNotes);
    setEditingReqId(null);
  };

  return (
    <div className="support-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>{t('supportHelpCenter')}</h2>
          <p>{t('supportSubtitle')}</p>
        </div>

        <div className="header-actions">
          <button className="call-btn" onClick={() => { window.location.href = `tel:${SUPPORT_PHONE_NUMBER.replace(/\s+/g, '')}`; }}>
            <Phone size={16} />
            <span>Call {SUPPORT_PHONE_NUMBER}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="subtab-bar">
        <button 
          className={`subtab-btn ${activeSubTab === 'MY_REQUESTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MY_REQUESTS')}
        >
          <PhoneCall size={16} />
          <span>My Support Requests ({myRequests.length})</span>
        </button>

        <button 
          className={`subtab-btn ${activeSubTab === 'FAQ' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('FAQ')}
        >
          <BookOpen size={16} />
          <span>Help & FAQ Directory</span>
        </button>

        <button 
          className={`subtab-btn admin ${activeSubTab === 'ADMIN_QUEUE' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ADMIN_QUEUE')}
        >
          <ShieldAlert size={16} />
          <span>Support Admin Queue ({callbackRequests.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: MY SUPPORT REQUESTS */}
      {activeSubTab === 'MY_REQUESTS' && (
        <div className="tab-content animate-fade-in">
          {/* Support Quick Action Cards */}
          <div className="support-quick-cards">
            <div className="quick-card primary" onClick={onRequestCallback}>
              <div className="q-icon crimson">
                <PhoneCall size={24} />
              </div>
              <div className="q-text">
                <h3>Request a Call</h3>
                <p>We will call back your registered phone {userProfile.phone}</p>
              </div>
              <button className="q-btn">Request Now</button>
            </div>

            <div className="quick-card" onClick={onEmailSupport}>
              <div className="q-icon indigo">
                <Mail size={24} />
              </div>
              <div className="q-text">
                <h3>Email Support Ticket</h3>
                <p>Submit formal technical queries to our engineers</p>
              </div>
              <button className="q-btn secondary">Open Ticket</button>
            </div>
          </div>

          {/* Active Callbacks Feed */}
          <div className="support-section">
            <h3>My Callback Requests</h3>

            <div className="requests-feed">
              {myRequests.length === 0 ? (
                <div className="empty-state">
                  <Clock size={36} />
                  <p>No active support callback requests.</p>
                </div>
              ) : (
                myRequests.map(req => (
                  <div key={req.id} className="req-card">
                    <div className="req-top">
                      <div className="req-id-box">
                        <span className="req-id">{req.requestId}</span>
                        <span className="req-cat">{req.category}</span>
                      </div>

                      <span className={`status-badge ${req.status.toLowerCase().replace(' ', '-')}`}>
                        {req.status === 'Resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{req.status}</span>
                      </span>
                    </div>

                    <p className="req-desc">{req.description || 'No additional issue description provided.'}</p>

                    <div className="req-footer">
                      <span className="req-phone"><Phone size={12} /> {req.phone}</span>
                      <span className="req-time">
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Support Tickets Feed */}
          <div className="support-section">
            <h3>My Email Tickets</h3>

            <div className="tickets-feed">
              {supportTickets.map(tkt => (
                <div key={tkt.id} className="tkt-card">
                  <div className="tkt-header">
                    <span className="tkt-id">{tkt.ticketId}</span>
                    <span className="tkt-subject">{tkt.subject}</span>
                    <span className="status-badge open">{tkt.status}</span>
                  </div>
                  <p className="tkt-body">{tkt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FAQ DIRECTORY */}
      {activeSubTab === 'FAQ' && (
        <div className="tab-content animate-fade-in">
          <div className="faq-toolbar">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search FAQ guides..."
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
              />
            </div>

            <div className="category-filters">
              <button className={`cat-btn ${faqCategoryFilter === 'ALL' ? 'active' : ''}`} onClick={() => setFaqCategoryFilter('ALL')}>All</button>
              <button className={`cat-btn ${faqCategoryFilter === 'Inventory' ? 'active' : ''}`} onClick={() => setFaqCategoryFilter('Inventory')}>Inventory</button>
              <button className={`cat-btn ${faqCategoryFilter === 'Khata Book' ? 'active' : ''}`} onClick={() => setFaqCategoryFilter('Khata Book')}>Khata Book</button>
              <button className={`cat-btn ${faqCategoryFilter === 'Camera / Scan' ? 'active' : ''}`} onClick={() => setFaqCategoryFilter('Camera / Scan')}>Camera & OCR</button>
              <button className={`cat-btn ${faqCategoryFilter === 'Account' ? 'active' : ''}`} onClick={() => setFaqCategoryFilter('Account')}>Account</button>
            </div>
          </div>

          <div className="faq-grid">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="faq-card">
                <span className="faq-cat-tag">{faq.category}</span>
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SUPPORT ADMIN QUEUE */}
      {activeSubTab === 'ADMIN_QUEUE' && (
        <div className="tab-content animate-fade-in">
          <div className="admin-banner">
            <ShieldAlert size={20} />
            <div>
              <h3>Support Team Queue (Admin View)</h3>
              <p>Manage shop callback requests, assign agents, update resolution statuses, and append internal notes.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer & Phone</th>
                  <th>Category & Description</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {callbackRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <span className="req-code">{req.requestId}</span>
                      <span className="req-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </td>

                    <td>
                      <span className="cust-name">{req.name}</span>
                      <span className="cust-phone"><Phone size={12} /> {req.phone}</span>
                    </td>

                    <td>
                      <span className="req-cat-badge">{req.category}</span>
                      <p className="req-desc-text">{req.description || 'No description'}</p>
                    </td>

                    <td>
                      <span className={`status-badge ${req.status.toLowerCase().replace(' ', '-')}`}>
                        {req.status}
                      </span>
                    </td>

                    <td>
                      <span className="agent-tag">{req.assignedAgentId || 'Unassigned'}</span>
                    </td>

                    <td>
                      <button 
                        className="admin-edit-btn"
                        onClick={() => {
                          setEditingReqId(req.id);
                          setAdminStatus(req.status);
                          setAdminNotes(req.internalNotes || '');
                        }}
                      >
                        <Edit3 size={14} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Request Edit Modal */}
      {editingReqId && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <h3>Manage Support Request ({editingReqId})</h3>
            
            <form onSubmit={handleAdminUpdateSubmit} className="admin-form">
              <div className="form-group">
                <label>Update Status</label>
                <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign Agent</label>
                <select value={adminAgent} onChange={e => setAdminAgent(e.target.value)}>
                  <option value="agent-1">Rahul Sharma (Agent 1)</option>
                  <option value="agent-2">Priya Patel (Agent 2)</option>
                  <option value="agent-3">Venkatesh Rao (Agent 3)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Internal Support Notes (Hidden from customer)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Spoke to customer, resolved voice settings issue..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Status</button>
                <button type="button" className="cancel-btn" onClick={() => setEditingReqId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .support-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .view-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
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

        .call-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #10b981;
          color: white;
          padding: 0.65rem 1.1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .subtab-bar {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .subtab-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(30, 41, 59, 0.7);
          color: #94a3b8;
          padding: 0.65rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .subtab-btn.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .subtab-btn.admin.active {
          background: #f59e0b;
          color: #0f172a;
          border-color: #f59e0b;
        }

        .support-quick-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .quick-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .quick-card:hover {
          transform: translateY(-2px);
        }

        .quick-card.primary {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .q-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .q-icon.crimson { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .q-icon.indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }

        .q-text {
          flex: 1;
        }

        .q-text h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .q-text p {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .q-btn {
          background: #ef4444;
          color: white;
          padding: 0.5rem 0.85rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .q-btn.secondary {
          background: #6366f1;
        }

        .support-section h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.85rem;
        }

        .requests-feed {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .req-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .req-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .req-id {
          font-size: 0.9rem;
          font-weight: 700;
          color: #38bdf8;
          margin-right: 0.5rem;
        }

        .req-cat {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .req-desc {
          font-size: 0.85rem;
          color: #cbd5e1;
        }

        .req-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .req-phone {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #94a3b8;
        }

        .tickets-feed {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tkt-card {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1rem;
        }

        .tkt-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.35rem;
        }

        .tkt-id {
          font-size: 0.85rem;
          font-weight: 700;
          color: #818cf8;
        }

        .tkt-subject {
          font-size: 0.9rem;
          font-weight: 700;
          color: #f8fafc;
          flex: 1;
        }

        .tkt-body {
          font-size: 0.8rem;
          color: #cbd5e1;
        }

        .faq-toolbar {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .search-box {
          position: relative;
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
          padding: 0.7rem 1rem 0.7rem 2.5rem;
          border-radius: 12px;
        }

        .category-filters {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
        }

        .cat-btn {
          background: rgba(30, 41, 59, 0.6);
          color: #94a3b8;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .cat-btn.active {
          background: #6366f1;
          color: white;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .faq-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .faq-cat-tag {
          font-size: 0.7rem;
          color: #818cf8;
          font-weight: 700;
          text-transform: uppercase;
        }

        .faq-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .faq-card p {
          font-size: 0.8rem;
          color: #cbd5e1;
          line-height: 1.4;
        }

        .admin-banner {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          padding: 1rem;
          border-radius: 14px;
          margin-bottom: 1.25rem;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: rgba(15, 23, 42, 0.6);
          padding: 0.85rem 1rem;
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .admin-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
        }

        .req-code { font-weight: 700; color: #38bdf8; display: block; }
        .req-date { font-size: 0.7rem; color: #64748b; }
        .cust-name { font-weight: 700; color: #f8fafc; display: block; }
        .cust-phone { font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 0.2rem; }
        .req-cat-badge { font-size: 0.7rem; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; padding: 0.15rem 0.4rem; border-radius: 4px; }
        .req-desc-text { font-size: 0.8rem; color: #cbd5e1; margin-top: 0.2rem; }
        .agent-tag { font-size: 0.75rem; color: #94a3b8; }

        .admin-edit-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
        }

        .status-badge.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .status-badge.assigned { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
        .status-badge.in-progress { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
        .status-badge.resolved { background: rgba(16, 185, 129, 0.2); color: #34d399; }

        .empty-state {
          text-align: center;
          padding: 2.5rem;
          color: #64748b;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          padding: 1.5rem;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .save-btn {
          flex: 1;
          background: #10b981;
          color: white;
          padding: 0.65rem;
          border-radius: 10px;
          font-weight: 600;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.65rem 1rem;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

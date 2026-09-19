import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  IndianRupee, 
  AlertTriangle, 
  Plus, 
  Search, 
  Mic, 
  Phone, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Check, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';
import { CustomerDetailModal } from './CustomerDetailModal';

export const KhataView = ({ onOpenVoice }) => {
  const { customers, khataTransactions, addCustomer, addCredit, recordPayment, deleteCustomer, settings } = useInventory();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  
  // Transaction entry modals
  const [creditModalCustomer, setCreditModalCustomer] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNotes, setCreditNotes] = useState('');

  const [paymentModalCustomer, setPaymentModalCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Delete customer safety warning modal
  const [deleteConfirmCust, setDeleteConfirmCust] = useState(null);

  // New Customer Form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Overpay Confirmation
  const [overpayWarning, setOverpayWarning] = useState(null);

  // Metrics
  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce((acc, c) => acc + c.currentBalance, 0);

  const overdueThreshold = settings.overdueDaysThreshold || 30;
  const overdueCustomers = customers.filter(c => {
    if (c.currentBalance <= 0) return false;
    const days = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days >= overdueThreshold;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim()
    });

    setNewCustName('');
    setNewCustPhone('');
    setIsAddCustOpen(false);
  };

  const handleCreditSubmit = (e) => {
    e.preventDefault();
    if (!creditModalCustomer || !creditAmount) return;

    addCredit(creditModalCustomer.id, Number(creditAmount), creditNotes, 'MANUAL');
    setCreditModalCustomer(null);
    setCreditAmount('');
    setCreditNotes('');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentModalCustomer || !paymentAmount) return;

    const res = recordPayment(paymentModalCustomer.id, Number(paymentAmount), paymentNotes, 'MANUAL');
    if (res.requiresConfirmation) {
      setOverpayWarning(res);
      return;
    }

    setPaymentModalCustomer(null);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const handleConfirmOverpay = () => {
    if (!overpayWarning) return;
    recordPayment(overpayWarning.customer.id, overpayWarning.amount, 'Overpayment confirmed', 'MANUAL', true);
    setOverpayWarning(null);
    setPaymentModalCustomer(null);
    setPaymentAmount('');
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmCust) return;
    deleteCustomer(deleteConfirmCust.id);
    setDeleteConfirmCust(null);
    if (selectedCustomer && selectedCustomer.id === deleteConfirmCust.id) {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="khata-container animate-fade-in">
      {/* Header & Prominent Voice Trigger */}
      <div className="khata-header">
        <div>
          <h2>{t('khataBookTitle')}</h2>
          <p>{t('khataSubtitle')}</p>
        </div>

        <div className="header-btns">
          <button className="voice-mic-btn" onClick={onOpenVoice}>
            <Mic size={18} />
            <span>🎤 {t('speakStock')}</span>
          </button>

          <button className="add-cust-btn" onClick={() => setIsAddCustOpen(true)}>
            <Plus size={18} />
            <span>{t('addCustomer')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{t('totalCustomers')}</span>
            <div className="kpi-icon indigo">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalCustomers}</div>
          <div className="kpi-footer">{t('activeCustomerAccounts')}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{t('totalOutstanding')}</span>
            <div className="kpi-icon crimson">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value crimson">₹ {totalOutstanding.toLocaleString('en-IN')}</div>
          <div className="kpi-footer crimson-text">{t('pendingCustomerCredit')}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{t('overdueCustomers')}</span>
            <div className="kpi-icon amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value amber">{overdueCustomers.length}</div>
          <div className="kpi-footer amber-text">{t('creditUnpaidDays', { days: overdueThreshold })}</div>
        </div>
      </div>

      {/* Overdue Alerts Section */}
      {overdueCustomers.length > 0 && (
        <div className="overdue-section">
          <div className="section-title amber">
            <AlertTriangle size={18} />
            <h3>{t('overdueCreditAccounts', { count: overdueCustomers.length })}</h3>
          </div>

          <div className="overdue-grid">
            {overdueCustomers.map(cust => {
              const days = Math.floor((Date.now() - new Date(cust.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={cust.id} className="overdue-card">
                  <div className="cust-row">
                    <span className="cust-name">{cust.name}</span>
                    <span className="days-badge">{t('daysOverdueLabel', { days })}</span>
                  </div>
                  <div className="cust-row bottom">
                    <span className="cust-phone"><Phone size={12} /> {cust.phone || 'N/A'}</span>
                    <span className="cust-due">₹{cust.currentBalance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t('searchCustomerPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers List Grid */}
      <div className="customers-list-section">
        <h3>{t('customerDirectory', { count: filteredCustomers.length })}</h3>

        <div className="customers-grid">
          {filteredCustomers.map(cust => (
            <div key={cust.id} className="customer-card">
              <div className="card-top">
                <div className="cust-info">
                  <h4 className="cust-name">{cust.name}</h4>
                  <span className="cust-phone"><Phone size={12} /> {cust.phone || t('noPhone')}</span>
                </div>

                <div className="cust-bal-col">
                  <span className={`bal-tag ${cust.currentBalance > 0 ? 'due' : 'settled'}`}>
                    ₹{cust.currentBalance.toLocaleString('en-IN')}
                  </span>
                  <span className="bal-sub">{cust.currentBalance > 0 ? t('outstanding') : t('settled')}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="card-btn credit"
                  onClick={() => { setCreditModalCustomer(cust); setCreditAmount(''); }}
                >
                  <Plus size={14} />
                  <span>+ {t('giveCredit')}</span>
                </button>

                <button 
                  className="card-btn payment"
                  onClick={() => { setPaymentModalCustomer(cust); setPaymentAmount(''); }}
                >
                  <Minus size={14} />
                  <span>- Payment</span>
                </button>

                <button 
                  className="card-btn view"
                  onClick={() => setSelectedCustomer(cust)}
                >
                  <span>Ledger</span>
                  <ChevronRight size={14} />
                </button>

                <button 
                  className="card-btn delete"
                  onClick={() => setDeleteConfirmCust(cust)}
                  title="Delete Customer Record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Add Customer */}
      {isAddCustOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <button className="close-btn" onClick={() => setIsAddCustOpen(false)}><X size={20} /></button>
            <h3>Add New Customer to Khata</h3>
            <form onSubmit={handleAddCustomerSubmit} className="cust-form">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar, Sunita..."
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn"><Check size={16} /> <span>Save Customer</span></button>
                <button type="button" className="cancel-btn" onClick={() => setIsAddCustOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Credit Given */}
      {creditModalCustomer && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <button className="close-btn" onClick={() => setCreditModalCustomer(null)}><X size={20} /></button>
            <h3>Record Udhaar (Credit) for {creditModalCustomer.name}</h3>
            <p className="modal-sub">Current Balance: ₹{creditModalCustomer.currentBalance.toLocaleString('en-IN')}</p>
            <form onSubmit={handleCreditSubmit} className="cust-form">
              <div className="form-group">
                <label>Credit Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="₹ 500"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Notes / Items Purchased (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 2 bags rice, oil bottle..."
                  value={creditNotes}
                  onChange={e => setCreditNotes(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn danger"><Plus size={16} /> <span>Record Udhaar (+₹{creditAmount || 0})</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Record Payment Received */}
      {paymentModalCustomer && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <button className="close-btn" onClick={() => setPaymentModalCustomer(null)}><X size={20} /></button>
            <h3>Record Payment Received from {paymentModalCustomer.name}</h3>
            <p className="modal-sub">Current Balance: ₹{paymentModalCustomer.currentBalance.toLocaleString('en-IN')}</p>
            <form onSubmit={handlePaymentSubmit} className="cust-form">
              <div className="form-group">
                <label>Payment Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="₹ 200"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Payment Mode / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cash, UPI, GPay..."
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn emerald"><Check size={16} /> <span>Record Payment (-₹{paymentAmount || 0})</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overpayment Warning Modal */}
      {overpayWarning && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up warning">
            <AlertCircle size={32} className="amber-icon" />
            <h3>Confirm Overpayment Amount</h3>
            <p>{overpayWarning.message}</p>
            <div className="modal-actions">
              <button className="save-btn emerald" onClick={handleConfirmOverpay}>Confirm Overpayment</button>
              <button className="cancel-btn" onClick={() => setOverpayWarning(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Safety Warning Modal */}
      {deleteConfirmCust && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up danger">
            <AlertTriangle size={36} className="crimson-icon" />
            <h3>Confirm Customer Deletion</h3>
            <p>You are about to delete <strong>{deleteConfirmCust.name}'s</strong> customer record.</p>
            <p className="warn-bal">Outstanding Balance: <strong>₹{deleteConfirmCust.currentBalance.toLocaleString('en-IN')}</strong></p>
            <p className="warn-sub">Are you sure you want to delete this customer ledger permanently?</p>
            <div className="modal-actions">
              <button className="save-btn danger" onClick={handleExecuteDelete}>
                <Trash2 size={16} />
                <span>Confirm Delete</span>
              </button>
              <button className="cancel-btn" onClick={() => setDeleteConfirmCust(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        onAddCredit={(c) => { setSelectedCustomer(null); setCreditModalCustomer(c); }}
        onRecordPayment={(c) => { setSelectedCustomer(null); setPaymentModalCustomer(c); }}
      />

      <style>{`
        .khata-container {
          padding: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .khata-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .khata-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .khata-header p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .header-btns {
          display: flex;
          gap: 0.75rem;
        }

        .voice-mic-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: white;
          padding: 0.6rem 1.1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
        }

        .add-cust-btn {
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

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

        .kpi-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .kpi-icon.crimson { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .kpi-value.crimson { color: #f87171; }
        .kpi-value.amber { color: #fbbf24; }

        .kpi-footer {
          font-size: 0.75rem;
          color: #64748b;
        }

        .crimson-text { color: #f87171; }
        .amber-text { color: #fbbf24; }

        .overdue-section {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
        }

        .section-title h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #fbbf24;
        }

        .overdue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.75rem;
        }

        .overdue-card {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cust-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cust-row.bottom { margin-top: 0.35rem; }

        .cust-name {
          font-weight: 700;
          color: #f8fafc;
        }

        .days-badge {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .cust-phone {
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .cust-due {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f87171;
        }

        .search-input-wrapper {
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

        .search-input-wrapper input {
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1rem 0.75rem 2.6rem;
          border-radius: 14px;
          font-size: 0.9rem;
        }

        .customers-list-section h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 1rem;
        }

        .customers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .customer-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cust-info h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .cust-bal-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .bal-tag {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .bal-tag.due { color: #f87171; }
        .bal-tag.settled { color: #34d399; }

        .bal-sub {
          font-size: 0.7rem;
          color: #64748b;
        }

        .card-actions {
          display: flex;
          gap: 0.4rem;
        }

        .card-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.45rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-btn.credit { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .card-btn.payment { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .card-btn.view { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; flex: 1; justify-content: center; }
        .card-btn.delete { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }

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
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          padding: 1.5rem;
          position: relative;
        }

        .modal-content.danger {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .modal-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .cust-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 0.85rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .form-group input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .save-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #6366f1;
          color: white;
          padding: 0.65rem;
          border-radius: 10px;
          font-weight: 600;
        }

        .save-btn.danger { background: #ef4444; }
        .save-btn.emerald { background: #10b981; }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.65rem 1rem;
          border-radius: 10px;
        }

        .warn-bal {
          font-size: 1.1rem;
          color: #f87171;
          margin: 0.5rem 0;
        }

        .warn-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .crimson-icon { color: #ef4444; margin-bottom: 0.5rem; }
        .amber-icon { color: #f59e0b; margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
};

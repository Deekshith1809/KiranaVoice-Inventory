import React, { useState, useEffect } from 'react';
import { X, Mail, Check, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { SUPPORT_CATEGORIES } from '../services/supportService';

export const EmailSupportModal = ({ isOpen, onClose }) => {
  const { userProfile, submitSupportTicket } = useInventory();

  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0]);
  const [subject, setSubject] = useState(`${SUPPORT_CATEGORIES[0]} - Support Request`);
  const [description, setDescription] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    setSubject(`${category} - Support Request`);
  }, [category]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const tkt = submitSupportTicket({
      category,
      subject,
      description
    });

    setSubmittedTicket(tkt);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up">
        <button className="close-btn" onClick={() => { setSubmittedTicket(null); onClose(); }}>
          <X size={20} />
        </button>

        {!submittedTicket ? (
          <>
            <div className="modal-header">
              <div className="modal-icon indigo">
                <Mail size={24} />
              </div>
              <h2>Email Support Request</h2>
              <p>Submit a formal ticket to our technical support team</p>
            </div>

            <form onSubmit={handleSubmit} className="ticket-form">
              <div className="form-group">
                <label>Issue Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {SUPPORT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Detailed Issue Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe what happened and how we can reproduce the issue..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="auto-info-box">
                <p className="auto-info-title">Auto-Filled Profile Information:</p>
                <p>Name: <strong>{userProfile.name}</strong> ({userProfile.shopName})</p>
                <p>Email: <strong>{userProfile.email}</strong> | Phone: <strong>{userProfile.phone}</strong></p>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-ticket-btn">
                  <Check size={18} />
                  <span>Send Support Request</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="confirmation-card animate-slide-up">
            <div className="check-hero">
              <Check size={42} />
            </div>
            <h3>✓ Ticket Submitted</h3>
            <p className="conf-sub">Your support ticket has been created successfully.</p>

            <div className="conf-ticket-box">
              <span>Ticket ID: <strong>{submittedTicket.ticketId}</strong></span>
            </div>

            <div className="conf-details-grid">
              <div className="conf-item">
                <span className="conf-label">Category</span>
                <span className="conf-val">{submittedTicket.category}</span>
              </div>
              <div className="conf-item">
                <span className="conf-label">Status</span>
                <span className="status-badge open">{submittedTicket.status}</span>
              </div>
              <div className="conf-item col-span-2">
                <span className="conf-label">Subject</span>
                <span className="conf-val">{submittedTicket.subject}</span>
              </div>
            </div>

            <button className="done-btn" onClick={() => { setSubmittedTicket(null); onClose(); }}>
              Done
            </button>
          </div>
        )}
      </div>

      <style>{`
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
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
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

        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .modal-icon.indigo {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .modal-header p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .ticket-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        input, select, textarea {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .auto-info-box {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .auto-info-title {
          font-weight: 700;
          color: #818cf8;
          margin-bottom: 0.25rem;
        }

        .submit-ticket-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #6366f1;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .confirmation-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }

        .check-hero {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .conf-ticket-box {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          font-size: 1rem;
        }

        .conf-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          padding: 1rem;
          border-radius: 14px;
          text-align: left;
        }

        .col-span-2 { grid-column: span 2; }

        .conf-item {
          display: flex;
          flex-direction: column;
        }

        .conf-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .conf-val {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .status-badge.open {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
        }

        .done-btn {
          width: 100%;
          background: #6366f1;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

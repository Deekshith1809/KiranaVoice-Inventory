import React, { useState, useEffect } from 'react';
import { X, PhoneCall, Check, Mic, Edit, Phone, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { SUPPORT_CATEGORIES } from '../services/supportService';
import { useTranslation } from '../services/i18n';

export const RequestCallbackModal = ({ isOpen, onClose, initialCategory = null }) => {
  const { userProfile, submitCallbackRequest, updateUserProfile } = useInventory();
  const { t } = useTranslation();

  const [phone, setPhone] = useState(userProfile.phone || '+91 9876543210');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  
  const [category, setCategory] = useState(initialCategory || SUPPORT_CATEGORIES[1]); // Default Voice Recognition
  const [description, setDescription] = useState('');
  const [isSpeakingDesc, setIsSpeakingDesc] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [submittedRequest, setSubmittedRequest] = useState(null);

  useEffect(() => {
    if (userProfile.phone) {
      setPhone(userProfile.phone);
    }
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [userProfile, initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleSavePhone = (e) => {
    e.preventDefault();
    if (!newPhoneInput.trim() || newPhoneInput.trim().length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number.');
      return;
    }

    const formatted = newPhoneInput.startsWith('+91') ? newPhoneInput : `+91 ${newPhoneInput.trim()}`;
    setPhone(formatted);
    updateUserProfile({ phone: formatted });
    setIsEditingPhone(false);
    setPhoneError('');
  };

  const handleStartVoiceDesc = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsSpeakingDesc(true);
      recognition.onresult = (e) => {
        const spokenText = e.results[0][0].transcript;
        setDescription(prev => prev ? `${prev} ${spokenText}` : spokenText);
        setIsSpeakingDesc(false);
      };
      recognition.onerror = () => setIsSpeakingDesc(false);
      recognition.onend = () => setIsSpeakingDesc(false);
      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser. Please type your description.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone) {
      setPhoneError('Phone number is required for a callback.');
      return;
    }

    const req = submitCallbackRequest({
      phone,
      category,
      description
    });

    setSubmittedRequest(req);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up">
        <button className="close-btn" onClick={() => { setSubmittedRequest(null); onClose(); }}>
          <X size={20} />
        </button>

        {!submittedRequest ? (
          <>
            <div className="modal-header">
              <div className="modal-icon crimson">
                <PhoneCall size={24} />
              </div>
              <h2>{t('requestCallback')}</h2>
              <p>Our support agent will call your phone number</p>
            </div>

            <form onSubmit={handleSubmit} className="callback-form">
              {/* Auto-filled User Name */}
              <div className="form-group">
                <label>Shop Owner Name</label>
                <input type="text" disabled value={userProfile.name} className="disabled-input" />
              </div>

              {/* Auto-filled & Editable Phone Number */}
              <div className="form-group">
                <div className="label-row">
                  <label>Registered Phone Number</label>
                  {!isEditingPhone && (
                    <button type="button" className="edit-phone-btn" onClick={() => { setIsEditingPhone(true); setNewPhoneInput(phone.replace('+91 ', '')); }}>
                      <Edit size={12} />
                      <span>Edit Phone</span>
                    </button>
                  )}
                </div>

                {!isEditingPhone ? (
                  <div className="phone-display-box">
                    <Phone size={16} className="phone-icon" />
                    <span className="phone-text">{phone}</span>
                  </div>
                ) : (
                  <div className="edit-phone-box">
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={newPhoneInput}
                      onChange={e => setNewPhoneInput(e.target.value)}
                    />
                    <button type="button" className="save-phone-btn" onClick={handleSavePhone}>Save</button>
                    <button type="button" className="cancel-phone-btn" onClick={() => setIsEditingPhone(false)}>Cancel</button>
                  </div>
                )}
                {phoneError && <span className="error-text"><AlertCircle size={12} /> {phoneError}</span>}
              </div>

              {/* Predefined Issue Category */}
              <div className="form-group">
                <label>Select Issue Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {SUPPORT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Optional Description with Spoken Speech Trigger */}
              <div className="form-group">
                <div className="label-row">
                  <label>Describe Your Issue (Optional)</label>
                  <button type="button" className="voice-speak-btn" onClick={handleStartVoiceDesc}>
                    <Mic size={14} className={isSpeakingDesc ? 'listening' : ''} />
                    <span>{isSpeakingDesc ? 'Listening...' : '🎤 Speak Issue'}</span>
                  </button>
                </div>
                <textarea
                  rows="3"
                  placeholder="e.g. Voice command for rice is not recognizing quantity..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-callback-btn">
                  <Check size={18} />
                  <span>Request Callback</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation View */
          <div className="confirmation-card animate-slide-up">
            <div className="check-hero">
              <Check size={42} />
            </div>
            <h3>✓ Callback Requested</h3>
            <p className="conf-sub">We have received your request. Our support team will call you at:</p>

            <div className="conf-phone-box">
              <Phone size={18} />
              <span>{submittedRequest.phone}</span>
            </div>

            <div className="conf-details-grid">
              <div className="conf-item">
                <span className="conf-label">Request ID</span>
                <span className="conf-val">{submittedRequest.requestId}</span>
              </div>
              <div className="conf-item">
                <span className="conf-label">Issue Category</span>
                <span className="conf-val">{submittedRequest.category}</span>
              </div>
              <div className="conf-item">
                <span className="conf-label">Status</span>
                <span className="status-badge pending">{submittedRequest.status}</span>
              </div>
              <div className="conf-item">
                <span className="conf-label">Requested Time</span>
                <span className="conf-val">
                  {new Date(submittedRequest.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(submittedRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <button className="done-btn" onClick={() => { setSubmittedRequest(null); onClose(); }}>
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
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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

        .modal-icon.crimson {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
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

        .callback-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .disabled-input {
          background: rgba(15, 23, 42, 0.4) !important;
          color: #94a3b8 !important;
        }

        .phone-display-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          color: #38bdf8;
          font-weight: 700;
        }

        .edit-phone-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          color: #818cf8;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .edit-phone-box {
          display: flex;
          gap: 0.35rem;
        }

        .edit-phone-box input {
          flex: 1;
        }

        .save-phone-btn {
          background: #10b981;
          color: white;
          padding: 0 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .cancel-phone-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0 0.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .error-text {
          font-size: 0.7rem;
          color: #f87171;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .voice-speak-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        input, select, textarea {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .modal-actions {
          margin-top: 0.5rem;
        }

        .submit-callback-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
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

        .confirmation-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .conf-sub {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .conf-phone-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .conf-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          padding: 1rem;
          border-radius: 14px;
          margin: 0.5rem 0;
          text-align: left;
        }

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

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
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

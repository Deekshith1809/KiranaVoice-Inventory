import React from 'react';
import { X, PhoneCall, Phone, Mail, Mic, BookOpen, HelpCircle } from 'lucide-react';
import { SUPPORT_PHONE_NUMBER } from '../services/supportService';

export const SupportPanelModal = ({ 
  isOpen, 
  onClose, 
  onRequestCallback, 
  onEmailSupport, 
  onVoiceSupport, 
  onOpenFaq 
}) => {
  if (!isOpen) return null;

  const handleDirectCall = () => {
    if (SUPPORT_PHONE_NUMBER) {
      window.location.href = `tel:${SUPPORT_PHONE_NUMBER.replace(/\s+/g, '')}`;
    } else {
      alert('Support phone number is not configured in settings.');
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="panel-header">
          <div className="panel-icon">
            <HelpCircle size={26} />
          </div>
          <h2>Need Help?</h2>
          <p>How can we assist your shop today?</p>
        </div>

        <div className="support-options-grid">
          {/* Option 1: Request Callback */}
          <button className="support-card-btn primary" onClick={() => { onClose(); onRequestCallback(); }}>
            <div className="card-icon crimson">
              <PhoneCall size={22} />
            </div>
            <div className="card-info">
              <span className="card-title">📞 Request a Call</span>
              <span className="card-sub">Our team will call your registered phone</span>
            </div>
          </button>

          {/* Option 2: Direct Call */}
          <button className="support-card-btn" onClick={handleDirectCall}>
            <div className="card-icon emerald">
              <Phone size={22} />
            </div>
            <div className="card-info">
              <span className="card-title">☎ Call Support</span>
              <span className="card-sub">Toll-free: {SUPPORT_PHONE_NUMBER}</span>
            </div>
          </button>

          {/* Option 3: Email Support */}
          <button className="support-card-btn" onClick={() => { onClose(); onEmailSupport(); }}>
            <div className="card-icon indigo">
              <Mail size={22} />
            </div>
            <div className="card-info">
              <span className="card-title">✉ Email Support</span>
              <span className="card-sub">Send a ticket to support team</span>
            </div>
          </button>

          {/* Option 4: Ask by Voice */}
          <button className="support-card-btn" onClick={() => { onClose(); onVoiceSupport(); }}>
            <div className="card-icon cyan">
              <Mic size={22} />
            </div>
            <div className="card-info">
              <span className="card-title">🎤 Ask by Voice</span>
              <span className="card-sub">Speak your issue in your regional language</span>
            </div>
          </button>

          {/* Option 5: Help & FAQ */}
          <button className="support-card-btn" onClick={() => { onClose(); onOpenFaq(); }}>
            <div className="card-icon amber">
              <BookOpen size={22} />
            </div>
            <div className="card-info">
              <span className="card-title">📖 Help / FAQ</span>
              <span className="card-sub">Browse short guides and step-by-step answers</span>
            </div>
          </button>
        </div>
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
          max-width: 480px;
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

        .panel-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .panel-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
        }

        .panel-header h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .panel-header p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .support-options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .support-card-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem 1rem;
          border-radius: 16px;
          text-align: left;
          transition: background 0.2s, transform 0.2s;
        }

        .support-card-btn:hover {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }

        .support-card-btn.primary {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon.crimson { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .card-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .card-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .card-icon.cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
        .card-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .card-info {
          display: flex;
          flex-direction: column;
        }

        .card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .card-sub {
          font-size: 0.75rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

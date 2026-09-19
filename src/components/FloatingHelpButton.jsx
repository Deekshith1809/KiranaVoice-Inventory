import React from 'react';
import { HelpCircle, PhoneCall, Sparkles } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const FloatingHelpButton = ({ onClick }) => {
  const { callbackRequests } = useInventory();
  const pendingCount = callbackRequests.filter(r => r.status === 'Pending' || r.status === 'Assigned' || r.status === 'In Progress').length;

  return (
    <button 
      className="floating-help-btn animate-fade-in"
      onClick={onClick}
      title="Need Help? Open Support Panel"
    >
      <div className="help-icon-wrapper">
        <HelpCircle size={24} className="help-icon" />
        {pendingCount > 0 && (
          <span className="help-badge">{pendingCount}</span>
        )}
      </div>
      <span className="help-text">Help</span>

      <style>{`
        .floating-help-btn {
          position: fixed;
          bottom: 85px;
          right: 20px;
          z-index: 80;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 0.75rem 1.1rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.45);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .floating-help-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(99, 102, 241, 0.6);
        }

        .help-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .help-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0f172a;
        }

        @media (min-width: 768px) {
          .floating-help-btn {
            bottom: 30px;
            right: 30px;
          }
        }
      `}</style>
    </button>
  );
};

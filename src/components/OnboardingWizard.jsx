import React, { useState } from 'react';
import { Mic, Package, BookOpen, Camera, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTranslation } from '../services/i18n';

export const OnboardingWizard = () => {
  const { userProfile, completeOnboarding } = useInventory();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  if (userProfile.onboardingCompleted) return null;

  const steps = [
    {
      icon: Sparkles,
      color: 'indigo',
      title: t('onboardingWelcome'),
      subtitle: 'Manage your entire shop using natural speech, inventory tracking, customer credit, and invoice OCR.',
      featureTitle: 'Voice-First Shop Management',
      featureDesc: 'Built for fast Kirana and retail shops. Speak in English, Telugu, or Hindi with minimal typing.'
    },
    {
      icon: Mic,
      color: 'crimson',
      title: `🎤 ${t('onboardingStep1')}`,
      subtitle: 'Step 1 of 4',
      featureTitle: 'Speak Naturally to Manage Stock',
      featureDesc: 'Tap the mic button and say "Add 20 bags of rice" or "Ramesh ko 500 udhaar diya". Verified intent confirmation cards keep your entries accurate.'
    },
    {
      icon: Package,
      color: 'cyan',
      title: `📦 ${t('inventoryCatalog')}`,
      subtitle: 'Step 2 of 4',
      featureTitle: 'Track Stock & Receive Reorder Alerts',
      featureDesc: 'Maintain exact product counts across Bags, Kg, Cartons, Litres, and Quintals. Get proactive notifications when stock runs low.'
    },
    {
      icon: BookOpen,
      color: 'amber',
      title: `📒 ${t('onboardingStep3')}`,
      subtitle: 'Step 3 of 4',
      featureTitle: 'Track Customer Udhaar & Payments',
      featureDesc: 'Record customer credit, view overdue accounts, and generate printable PDF statements for your customers.'
    },
    {
      icon: Camera,
      color: 'emerald',
      title: `📷 ${t('scanTitle')}`,
      subtitle: 'Step 4 of 4',
      featureTitle: 'Scan Supplier Invoices & Barcodes',
      featureDesc: 'Capture supplier invoices with automatic line-item parsing, invoice total cross-checks, and stock delta updates.'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="onboarding-modal-content animate-slide-up">
        <button className="skip-x-btn" onClick={handleSkip} title="Skip Onboarding">
          <X size={20} />
        </button>

        {/* Step Indicator Dots */}
        <div className="step-dots">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'done' : ''}`}
            ></div>
          ))}
        </div>

        {/* Step Header */}
        <div className="step-header">
          <div className={`step-icon ${current.color}`}>
            <Icon size={32} />
          </div>
          <h2>{current.title}</h2>
          <p className="step-sub">{current.subtitle}</p>
        </div>

        {/* Feature Highlight Box */}
        <div className="feature-card">
          <h4>{current.featureTitle}</h4>
          <p>{current.featureDesc}</p>
        </div>

        {/* Action Controls */}
        <div className="onboarding-actions">
          <button className="skip-btn" onClick={handleSkip}>
            Skip Guide
          </button>

          <button className="next-btn" onClick={handleNext}>
            <span>{currentStep === steps.length - 1 ? 'Finish & Start' : 'Next Step'}</span>
            {currentStep === steps.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 120;
          padding: 1rem;
        }

        .onboarding-modal-content {
          background: #1e293b;
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 28px;
          width: 100%;
          max-width: 480px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 25px 60px -12px rgba(99, 102, 241, 0.3);
          text-align: center;
        }

        .skip-x-btn {
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

        .step-dots {
          display: flex;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }

        .dot.active {
          width: 24px;
          background: #6366f1;
        }

        .dot.done {
          background: #10b981;
        }

        .step-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .step-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .step-icon.indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
        .step-icon.crimson { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .step-icon.cyan { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }
        .step-icon.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .step-icon.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }

        .step-header h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .step-sub {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .feature-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .feature-card h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #38bdf8;
          margin-bottom: 0.35rem;
        }

        .feature-card p {
          font-size: 0.85rem;
          color: #cbd5e1;
          line-height: 1.4;
        }

        .onboarding-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .skip-btn {
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .next-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #6366f1;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
};

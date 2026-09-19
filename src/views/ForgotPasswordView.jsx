import React, { useState } from 'react';
import { KeyRound, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordView = ({ onNavigateToLogin, onNavigateToReset }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [devResetToken, setDevResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await forgotPassword(email);
      setResultMessage(res.message);
      if (res.resetTokenDev) {
        setDevResetToken(res.resetTokenDev);
      }
    } catch (err) {
      setResultMessage('If an account exists for this email, password reset instructions have been sent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card animate-slide-up">
        <button className="back-link-btn" onClick={onNavigateToLogin}>
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <div className="auth-header">
          <div className="brand-logo-badge">
            <KeyRound size={26} />
          </div>
          <h2>Forgot Password?</h2>
          <p>Enter your registered email to receive password reset instructions</p>
        </div>

        {resultMessage ? (
          <div className="success-banner-box animate-fade-in">
            <CheckCircle2 size={24} className="emerald-icon" />
            <p>{resultMessage}</p>
            {devResetToken && (
              <div className="dev-token-box">
                <span className="dev-label">Dev Test Reset Token:</span>
                <code className="dev-token">{devResetToken}</code>
                <button 
                  className="reset-direct-btn"
                  onClick={() => onNavigateToReset(devResetToken)}
                >
                  Proceed to Reset Password →
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Registered Email Address *</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}
      </div>

      <style>{`
        .auth-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%), #0f172a;
          padding: 1.5rem;
        }

        .auth-card {
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          width: 100%;
          max-width: 440px;
          padding: 2.25rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        }

        .back-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .brand-logo-badge {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
          margin-bottom: 0.85rem;
        }

        .auth-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .auth-header p {
          font-size: 0.82rem;
          color: #94a3b8;
          margin-top: 0.2rem;
        }

        .success-banner-box {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #34d399;
          font-size: 0.9rem;
        }

        .dev-token-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px dashed rgba(99, 102, 241, 0.4);
          padding: 0.85rem;
          border-radius: 12px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: center;
        }

        .dev-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .dev-token {
          background: #0f172a;
          color: #38bdf8;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.8rem;
          word-break: break-all;
        }

        .reset-direct-btn {
          background: #6366f1;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #64748b;
        }

        .input-wrapper input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .auth-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #f59e0b;
          color: #0f172a;
          padding: 0.85rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

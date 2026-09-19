import React, { useState } from 'react';
import { Store, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView = ({ onNavigateToRegister, onNavigateToForgot, onLoginSuccess }) => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: true
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card animate-slide-up">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="brand-logo-badge">
            <Store size={26} />
          </div>
          <h2>KiranaVoice Inventory</h2>
          <p>Voice-First Multilingual Shop Management System</p>
        </div>

        {error && (
          <div className="auth-error-alert animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address or Phone Number *</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                required
                placeholder="e.g. ramesh@kirana.com or 9876543210"
                value={formData.usernameOrEmail}
                onChange={e => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password *</label>
              <button 
                type="button" 
                className="forgot-link"
                onClick={onNavigateToForgot}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Shop'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Credentials Quick Switcher */}
        <div className="demo-credentials-box">
          <div className="demo-title">
            <Sparkles size={14} />
            <span>Demo Test Credentials</span>
          </div>
          <button 
            className="demo-account-chip"
            onClick={() => setFormData({ usernameOrEmail: 'ramesh@kirana.com', password: 'pass123', rememberMe: true })}
          >
            <strong>Ramesh Kumar:</strong> ramesh@kirana.com / pass123
          </button>
        </div>

        <div className="auth-footer">
          <p>Don't have a shop account yet?</p>
          <button className="register-link" onClick={onNavigateToRegister}>
            Create New Account
          </button>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(239, 68, 68, 0.1), transparent 40%),
                      #0f172a;
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

        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .brand-logo-badge {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
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

        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
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

        .forgot-link {
          background: transparent;
          color: #818cf8;
          font-size: 0.78rem;
          font-weight: 600;
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

        .checkbox-row {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
          cursor: pointer;
        }

        .auth-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 0.85rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
          margin-top: 0.5rem;
        }

        .demo-credentials-box {
          background: rgba(15, 23, 42, 0.5);
          border: 1px dashed rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          padding: 0.75rem;
          margin-top: 1.25rem;
        }

        .demo-title {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #818cf8;
          margin-bottom: 0.4rem;
        }

        .demo-account-chip {
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          font-size: 0.75rem;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          width: 100%;
          text-align: left;
        }

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.25rem;
        }

        .auth-footer p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .register-link {
          background: transparent;
          color: #38bdf8;
          font-weight: 700;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

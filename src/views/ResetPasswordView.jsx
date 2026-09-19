import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResetPasswordView = ({ initialToken = '', onNavigateToLogin }) => {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired password reset token.');
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
            <Lock size={26} />
          </div>
          <h2>Reset Your Password</h2>
          <p>Enter your reset token and new password</p>
        </div>

        {error && (
          <div className="auth-error-alert animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="success-banner-box animate-fade-in">
            <CheckCircle2 size={36} className="emerald-icon" />
            <h4>Password Updated Successfully!</h4>
            <p>You can now log in with your new password.</p>
            <button className="auth-submit-btn" onClick={onNavigateToLogin}>
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Reset Token *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  required
                  placeholder="rst-..."
                  value={token}
                  onChange={e => setToken(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Updating Password...' : 'Reset Password'}</span>
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
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
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

        .success-banner-box {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #34d399;
        }

        .emerald-icon { color: #34d399; }

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
          background: #10b981;
          color: white;
          padding: 0.85rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
          margin-top: 0.5rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

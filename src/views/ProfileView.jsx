import React, { useState } from 'react';
import { User, Store, Phone, Mail, Languages, Shield, Edit, KeyRound, LogOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../services/i18n';

export const ProfileView = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { t } = useTranslation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    shopName: user?.shopName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredLanguage: user?.preferredLanguage || 'en'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await updateProfile(profileForm);
      setProfileMessage('Profile details updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMessage(`Error: ${err.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setIsSubmittingPwd(true);

    try {
      const res = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setPasswordMessage(res.message || 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header">
        <div>
          <h2>{t('userProfile')}</h2>
          <p>{t('profileSubtitle')}</p>
        </div>

        <button className="logout-btn-header" onClick={logout}>
          <LogOut size={16} />
          <span>{t('logout')}</span>
        </button>
      </div>

      {profileMessage && (
        <div className="success-alert animate-fade-in">
          <Check size={18} />
          <span>{profileMessage}</span>
        </div>
      )}

      {/* Main Profile & Shop Card */}
      <div className="profile-card">
        <div className="user-avatar-large">
          <span>{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
        </div>

        <div className="user-info-section">
          <h3>{user.fullName}</h3>
          <p className="shop-title-sub">{user.shopName}</p>
          <div className="role-badge">
            <Shield size={12} />
            <span>{user.role}</span>
          </div>
        </div>

        <button 
          className="edit-profile-btn"
          onClick={() => {
            setProfileForm({
              fullName: user.fullName,
              shopName: user.shopName,
              phone: user.phone,
              email: user.email,
              preferredLanguage: user.preferredLanguage
            });
            setIsEditingProfile(true);
          }}
        >
          <Edit size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Account Details Grid */}
      <div className="details-grid">
        <div className="detail-card">
          <div className="detail-icon"><User size={18} /></div>
          <div>
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user.fullName}</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon"><Store size={18} /></div>
          <div>
            <span className="detail-label">Shop Name</span>
            <span className="detail-value">{user.shopName}</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon"><Phone size={18} /></div>
          <div>
            <span className="detail-label">Phone Number</span>
            <span className="detail-value">{user.phone}</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon"><Mail size={18} /></div>
          <div>
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user.email}</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon"><Languages size={18} /></div>
          <div>
            <span className="detail-label">Preferred Language</span>
            <span className="detail-value">
              {user.preferredLanguage === 'te' ? 'తెలుగు (Telugu)' : user.preferredLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English'}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon"><Shield size={18} /></div>
          <div>
            <span className="detail-label">Shop ID / Isolation Key</span>
            <code className="shop-id-code">{user.shopId}</code>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="password-section">
        <div className="section-title">
          <KeyRound size={20} />
          <h3>Change Account Password</h3>
        </div>

        {passwordMessage && (
          <div className="success-alert" style={{ marginBottom: '1rem' }}>
            <Check size={18} />
            <span>{passwordMessage}</span>
          </div>
        )}

        {passwordError && (
          <div className="error-alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-group">
            <label>Current Password *</label>
            <input
              type="password"
              required
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>New Password *</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="save-pwd-btn" disabled={isSubmittingPwd}>
            <span>{isSubmittingPwd ? 'Updating Password...' : 'Change Password'}</span>
          </button>
        </form>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <h3>Edit Account Profile</h3>
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Shop / Business Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.shopName}
                  onChange={e => setProfileForm({ ...profileForm, shopName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Preferred Language</label>
                <select
                  value={profileForm.preferredLanguage}
                  onChange={e => setProfileForm({ ...profileForm, preferredLanguage: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              <div className="modal-btns">
                <button type="submit" className="save-pwd-btn">Save Profile Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .profile-container {
          padding: 1.25rem;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .profile-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .profile-header p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .logout-btn-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 0.6rem 1.1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .success-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .profile-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .user-avatar-large {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .user-info-section {
          flex: 1;
        }

        .user-info-section h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .shop-title-sub {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 0.35rem;
        }

        .edit-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1rem;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .detail-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #64748b;
          display: block;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .shop-id-code {
          background: rgba(15, 23, 42, 0.8);
          color: #38bdf8;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .password-section {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #f8fafc;
          margin-bottom: 1rem;
        }

        .section-title h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .password-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        input, select {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.7rem 0.85rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .save-pwd-btn {
          background: #6366f1;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
        }

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
        }

        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1rem;
        }

        .modal-btns {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

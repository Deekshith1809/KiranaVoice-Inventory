import React, { useEffect } from 'react';
import { Mic, Languages, Sparkles, Store, Sun, Moon, LogOut } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../services/i18n';

export const Header = ({ onOpenVoice, activeTab, onNavigate }) => {
  const { settings, setSettings, setAppLanguage } = useInventory();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  const currentTheme = settings.theme || 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setSettings(prev => ({
      ...prev,
      theme: nextTheme
    }));
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLanguageChange = (lang) => {
    let speechLang = 'en-IN';
    if (lang === 'te') speechLang = 'te-IN';
    if (lang === 'hi') speechLang = 'hi-IN';
    
    setAppLanguage(lang);
    setSettings(prev => ({
      ...prev,
      speechLanguage: speechLang
    }));
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="store-icon-wrapper">
          <Store size={22} className="store-icon" />
        </div>
        <div>
          <h1 className="store-title">{user?.shopName || 'KiranaVoice Inventory'}</h1>
          <p className="store-subtitle">{user?.fullName ? `${t('owner')}: ${user.fullName}` : t('dashboardSubtitle')}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Dark / Light Mode Toggle Button */}
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {currentTheme === 'dark' ? (
            <Sun size={18} className="theme-icon sun" />
          ) : (
            <Moon size={18} className="theme-icon moon" />
          )}
          <span className="theme-label">{currentTheme === 'dark' ? t('lightMode') : t('darkMode')}</span>
        </button>

        {/* Quick Language Switcher */}
        <div className="lang-switcher">
          <Languages size={16} className="lang-icon" />
          <button 
            className={`lang-btn ${settings.appLanguage === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
            title="English Interface"
          >
            EN
          </button>
          <button 
            className={`lang-btn ${settings.appLanguage === 'te' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('te')}
            title="Telugu Interface (తెలుగు)"
          >
            తెలుగు
          </button>
          <button 
            className={`lang-btn ${settings.appLanguage === 'hi' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('hi')}
            title="Hindi Interface (हिंदी)"
          >
            हिंदी
          </button>
        </div>

        {/* User Account / Profile Badge */}
        {isAuthenticated && (
          <button 
            className="user-profile-badge"
            onClick={() => onNavigate && onNavigate('profile')}
            title="User Profile & Settings"
          >
            <div className="avatar-circle">
              <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <span className="user-name-text">{user?.fullName}</span>
          </button>
        )}

        {/* Logout Button */}
        {isAuthenticated && (
          <button 
            className="icon-header-btn logout"
            onClick={logout}
            title={t('logout')}
          >
            <LogOut size={16} />
          </button>
        )}

        {/* Primary Mic Trigger Button */}
        <button 
          className="header-mic-btn"
          onClick={onOpenVoice}
          title={t('speakStock')}
        >
          <div className="mic-pulse"></div>
          <Mic size={20} className="mic-icon" />
          <span className="mic-text">{t('speakStock')}</span>
          <Sparkles size={14} className="sparkle-icon" />
        </button>
      </div>

      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .store-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .store-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.2;
        }

        .store-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(30, 41, 59, 0.8);
          color: #f59e0b;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lang-switcher {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(30, 41, 59, 0.8);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lang-icon { color: #94a3b8; margin-right: 0.25rem; }

        .lang-btn {
          background: transparent;
          color: #94a3b8;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .lang-btn.active {
          background: #6366f1;
          color: white;
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.65rem 0.25rem 0.35rem;
          border-radius: 9999px;
          color: #f8fafc;
        }

        .avatar-circle {
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #6366f1;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name-text {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .icon-header-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-mic-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: white;
          padding: 0.6rem 1.25rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .user-name-text { display: none; }
          .store-subtitle { display: none; }
          .mic-text { display: none; }
          .theme-label { display: none; }
        }
      `}</style>
    </header>
  );
};

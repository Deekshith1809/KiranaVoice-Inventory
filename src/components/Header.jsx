import React, { useEffect } from 'react';
import { Mic, Languages, Sparkles, Store, Sun, Moon } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Header = ({ onOpenVoice, activeTab }) => {
  const { settings, setSettings, products } = useInventory();
  
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
    setSettings(prev => ({
      ...prev,
      appLanguage: lang,
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
          <h1 className="store-title">KiranaVoice Inventory</h1>
          <p className="store-subtitle">Voice-First Shop Management</p>
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
          <span className="theme-label">{currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
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

        {/* Primary Mic Trigger Button */}
        <button 
          className="header-mic-btn"
          onClick={onOpenVoice}
          title="Speak command to manage stock"
        >
          <div className="mic-pulse"></div>
          <Mic size={20} className="mic-icon" />
          <span className="mic-text">Speak Stock</span>
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
          gap: 0.75rem;
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
          transition: all 0.2s;
        }

        [data-theme='light'] .theme-toggle-btn {
          background: rgba(241, 245, 249, 0.9);
          color: #6366f1;
          border-color: rgba(0, 0, 0, 0.1);
        }

        .theme-toggle-btn:hover {
          transform: scale(1.05);
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

        .lang-icon {
          color: #94a3b8;
          margin-right: 0.25rem;
        }

        .lang-btn {
          background: transparent;
          color: #94a3b8;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .lang-btn.active {
          background: #6366f1;
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
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
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .header-mic-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
        }

        .mic-pulse {
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          border: 2px solid #ef4444;
          animation: pulseGlow 2s infinite;
          opacity: 0.6;
        }

        @media (max-width: 640px) {
          .store-subtitle { display: none; }
          .mic-text { display: none; }
          .theme-label { display: none; }
          .header-mic-btn { padding: 0.6rem 0.8rem; }
        }
      `}</style>
    </header>
  );
};

import React, { useState } from 'react';
import { Settings, Globe, Mic, Plus, Volume2, RotateCcw, Check, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const SettingsView = () => {
  const { settings, setSettings, addCustomUnit, resetToDemoData } = useInventory();

  const [newUnitText, setNewUnitText] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnitText.trim()) return;
    addCustomUnit(newUnitText.trim());
    setNewUnitText('');
  };

  const handleReset = () => {
    if (window.confirm('Reset all inventory and transaction history to initial sample data?')) {
      resetToDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>System Settings & Preferences</h2>
          <p>Language selection, custom trade units, and audio controls</p>
        </div>
      </div>

      {resetSuccess && (
        <div className="reset-banner animate-fade-in">
          <Check size={18} />
          <span>Demo data restored successfully!</span>
        </div>
      )}

      {/* 1. App Language & Regional Settings */}
      <div className="settings-card">
        <div className="card-header">
          <Globe size={20} className="icon indigo" />
          <div>
            <h3>Application Language</h3>
            <p>Select interface display language</p>
          </div>
        </div>

        <div className="radio-group">
          <label className={`radio-card ${settings.appLanguage === 'en' ? 'active' : ''}`}>
            <input
              type="radio"
              name="appLang"
              value="en"
              checked={settings.appLanguage === 'en'}
              onChange={() => setSettings(prev => ({ ...prev, appLanguage: 'en', speechLanguage: 'en-IN' }))}
            />
            <span className="lang-name">English</span>
            <span className="lang-desc">Standard English Interface</span>
          </label>

          <label className={`radio-card ${settings.appLanguage === 'te' ? 'active' : ''}`}>
            <input
              type="radio"
              name="appLang"
              value="te"
              checked={settings.appLanguage === 'te'}
              onChange={() => setSettings(prev => ({ ...prev, appLanguage: 'te', speechLanguage: 'te-IN' }))}
            />
            <span className="lang-name">తెలుగు (Telugu)</span>
            <span className="lang-desc">Telugu regional terminology</span>
          </label>

          <label className={`radio-card ${settings.appLanguage === 'hi' ? 'active' : ''}`}>
            <input
              type="radio"
              name="appLang"
              value="hi"
              checked={settings.appLanguage === 'hi'}
              onChange={() => setSettings(prev => ({ ...prev, appLanguage: 'hi', speechLanguage: 'hi-IN' }))}
            />
            <span className="lang-name">हिंदी (Hindi)</span>
            <span className="lang-desc">Hindi trade terms</span>
          </label>
        </div>
      </div>

      {/* 2. Voice & Speech Recognition Settings */}
      <div className="settings-card">
        <div className="card-header">
          <Mic size={20} className="icon cyan" />
          <div>
            <h3>Speech Recognition Engine</h3>
            <p>Configure speech recognition dialect and text-to-speech audio feedback</p>
          </div>
        </div>

        <div className="setting-row">
          <label>Spoken Language Model</label>
          <select
            value={settings.speechLanguage}
            onChange={e => setSettings(prev => ({ ...prev, speechLanguage: e.target.value }))}
          >
            <option value="te-IN">Telugu (India) - te-IN</option>
            <option value="hi-IN">Hindi (India) - hi-IN</option>
            <option value="en-IN">English (India) - en-IN</option>
          </select>
        </div>

        <div className="setting-row">
          <div>
            <label>Text-to-Speech Spoken Feedback</label>
            <p className="setting-sub">Speak spoken confirmation after inventory actions</p>
          </div>
          <button 
            className={`toggle-btn ${settings.soundEnabled ? 'active' : ''}`}
            onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          >
            {settings.soundEnabled ? 'ON 🔊' : 'OFF 🔇'}
          </button>
        </div>
      </div>

      {/* 3. Custom Trade Units Manager */}
      <div className="settings-card">
        <div className="card-header">
          <Plus size={20} className="icon emerald" />
          <div>
            <h3>Custom Trade Units</h3>
            <p>Manage regional measurement trade units for your shop</p>
          </div>
        </div>

        <form onSubmit={handleAddUnit} className="unit-add-form">
          <input
            type="text"
            placeholder="e.g. Bundles, Tins, Jars..."
            value={newUnitText}
            onChange={e => setNewUnitText(e.target.value)}
          />
          <button type="submit" className="add-unit-btn">
            <Plus size={16} />
            <span>Add Unit</span>
          </button>
        </form>

        <div className="units-chip-grid">
          {settings.customUnits.map(unit => (
            <span key={unit} className="unit-tag">
              {unit}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Prototype Reset */}
      <div className="settings-card danger">
        <div className="card-header">
          <RotateCcw size={20} className="icon crimson" />
          <div>
            <h3>Reset Prototype Data</h3>
            <p>Restore initial sample dataset (Rice 45 Bags, Sugar 70 Kg, Biscuits 8 Cartons...)</p>
          </div>
        </div>

        <button className="reset-data-btn" onClick={handleReset}>
          <RotateCcw size={16} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <style>{`
        .settings-container {
          padding: 1.25rem;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .view-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .view-header p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .reset-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .settings-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .settings-card.danger {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .card-header p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .icon.indigo { color: #818cf8; }
        .icon.cyan { color: #22d3ee; }
        .icon.emerald { color: #34d399; }
        .icon.crimson { color: #f87171; }

        .radio-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.85rem;
        }

        .radio-card {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .radio-card input { display: none; }

        .radio-card.active {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.12);
        }

        .lang-name {
          font-weight: 700;
          color: #f8fafc;
          font-size: 0.95rem;
        }

        .lang-desc {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.5);
          padding: 0.85rem 1rem;
          border-radius: 12px;
        }

        .setting-row label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .setting-sub {
          font-size: 0.75rem;
          color: #64748b;
        }

        .setting-row select {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .toggle-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.4rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .toggle-btn.active {
          background: #10b981;
          color: white;
        }

        .unit-add-form {
          display: flex;
          gap: 0.75rem;
        }

        .unit-add-form input {
          flex: 1;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .add-unit-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #6366f1;
          color: white;
          padding: 0.65rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .units-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .unit-tag {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .reset-data-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #ef4444;
          color: white;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          width: fit-content;
        }
      `}</style>
    </div>
  );
};

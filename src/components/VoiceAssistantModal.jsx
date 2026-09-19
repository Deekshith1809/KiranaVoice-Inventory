import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Check, Sparkles, AlertCircle, AlertTriangle, UserCheck, BookOpen, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { parseVoiceTranscript, PRESET_VOICE_COMMANDS } from '../services/voiceNLP';

export const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const { 
    products, 
    customers, 
    addStock, 
    removeStock, 
    addCustomer, 
    addCredit, 
    recordPayment, 
    deleteCustomer, 
    settings 
  } = useInventory();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Tap microphone or select a voice sample below');
  const [errorMessage, setErrorMessage] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [selectedAmbiguousCustomer, setSelectedAmbiguousCustomer] = useState(null);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setStatusMessage('Listening to your spoken command...');
        setErrorMessage('');
      };

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Live parsing for both Inventory & Khata
        const parsed = parseVoiceTranscript(currentTranscript, products, customers);
        setParsedData(parsed);
      };

      recognitionRef.current.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access blocked. Click preset chips below to test!');
        } else {
          setErrorMessage(`Mic error: ${event.error}. Use preset chips below to simulate speech.`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setStatusMessage('Finished listening. Verify details below:');
      };
    }
  }, [products, customers]);

  useEffect(() => {
    if (recognitionRef.current && settings.speechLanguage) {
      recognitionRef.current.lang = settings.speechLanguage;
    }
  }, [settings.speechLanguage]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setParsedData(null);
      setExecutionResult(null);
      setSelectedAmbiguousCustomer(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Mic start failed:', err);
        setErrorMessage('Direct mic start unavailable. Select sample commands below!');
      }
    }
  };

  const handleSelectPreset = (commandText) => {
    setTranscript(commandText);
    setExecutionResult(null);
    setErrorMessage('');
    setSelectedAmbiguousCustomer(null);
    setStatusMessage('Sample spoken command recognized!');
    
    const parsed = parseVoiceTranscript(commandText, products, customers);
    setParsedData(parsed);

    speakAudio(`Recognized command: ${commandText}`);
  };

  const speakAudio = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && settings.soundEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Confirm extracted voice action
  const handleConfirmAction = () => {
    if (!parsedData) return;

    let res = null;
    const { category, intent, productId, product, quantity, unit, customerName, customerId, amount, phone } = parsedData;
    const targetCustId = selectedAmbiguousCustomer ? selectedAmbiguousCustomer.id : customerId;
    const targetCustName = selectedAmbiguousCustomer ? selectedAmbiguousCustomer.name : customerName;

    // A. INVENTORY ACTIONS
    if (category === 'INVENTORY') {
      if (intent === 'ADD_STOCK') {
        res = addStock(productId || product, quantity, unit, 'VOICE');
        if (res.success) {
          const msg = `Successfully added ${quantity} ${unit} of ${res.productName}!`;
          setExecutionResult({ success: true, message: msg });
          speakAudio(msg);
        }
      } else if (intent === 'REMOVE_STOCK') {
        res = removeStock(productId || product, quantity, unit, 'VOICE');
        if (res.success) {
          const msg = `Successfully removed ${quantity} ${unit} of ${res.productName}!`;
          setExecutionResult({ success: true, message: msg });
          speakAudio(msg);
        } else {
          setExecutionResult({ success: false, message: res.message });
          speakAudio(res.message);
        }
      } else if (intent === 'CHECK_STOCK') {
        const item = products.find(p => p.name.toLowerCase() === product.toLowerCase());
        const msg = item ? `${item.name} current stock is ${item.quantity} ${item.unit}.` : `Product ${product} not found.`;
        setExecutionResult({ success: true, message: msg });
        speakAudio(msg);
      } else if (intent === 'LOW_STOCK') {
        const lowItems = products.filter(p => p.quantity <= p.reorderLevel);
        const msg = lowItems.length > 0 
          ? `${lowItems.length} products low in stock: ${lowItems.map(p => p.name).join(', ')}.`
          : 'All products are currently well stocked!';
        setExecutionResult({ success: true, message: msg });
        speakAudio(msg);
      }
    } 
    // B. KHATA BOOK ACTIONS
    else if (category === 'KHATA') {
      if (intent === 'ADD_CUSTOMER') {
        const newC = addCustomer({ name: customerName, phone });
        const msg = `Added new customer ${newC.name} to Khata book.`;
        setExecutionResult({ success: true, message: msg });
        speakAudio(msg);
      } else if (intent === 'CREDIT_GIVEN') {
        res = addCredit(targetCustId || targetCustName, amount, 'Voice credit given', 'VOICE');
        if (res.success) {
          const msg = `Recorded ₹${amount} credit for ${res.customerName}. New Balance: ₹${res.newBalance.toLocaleString('en-IN')}`;
          setExecutionResult({ success: true, message: msg });
          speakAudio(msg);
        } else {
          setExecutionResult({ success: false, message: res.message });
        }
      } else if (intent === 'PAYMENT_RECEIVED') {
        res = recordPayment(targetCustId || targetCustName, amount, 'Voice payment received', 'VOICE', true);
        if (res.success) {
          const msg = `Recorded ₹${amount} payment from ${res.customerName}. New Balance: ₹${res.newBalance.toLocaleString('en-IN')}`;
          setExecutionResult({ success: true, message: msg });
          speakAudio(msg);
        } else {
          setExecutionResult({ success: false, message: res.message });
        }
      } else if (intent === 'CHECK_CUSTOMER_BALANCE') {
        const cust = customers.find(c => c.name.toLowerCase() === targetCustName.toLowerCase());
        const msg = cust 
          ? `${cust.name} ka outstanding balance ₹${cust.currentBalance.toLocaleString('en-IN')} hai.` 
          : `Customer ${targetCustName} not found.`;
        setExecutionResult({ success: true, message: msg });
        speakAudio(msg);
      } else if (intent === 'TOTAL_OUTSTANDING') {
        const total = customers.reduce((acc, c) => acc + c.currentBalance, 0);
        const msg = `Total outstanding balance across all customers is ₹${total.toLocaleString('en-IN')}.`;
        setExecutionResult({ success: true, message: msg });
        speakAudio(msg);
      } else if (intent === 'DELETE_CUSTOMER') {
        res = deleteCustomer(targetCustId || targetCustName);
        const msg = `Deleted customer record for ${targetCustName}.`;
        setExecutionResult({ success: true, message: msg });
        speakAudio(msg);
      }
    }
  };

  return (
    <div className="voice-modal-overlay animate-fade-in">
      <div className="voice-modal-content animate-slide-up">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="voice-badge">
            <Sparkles size={14} />
            <span>Voice Assistant (Inventory & Khata)</span>
          </div>
          <h2>Tap & Speak Spoken Command</h2>
          <p className="status-text">{statusMessage}</p>
        </div>

        {/* Big Pulsing Mic Button */}
        <div className="mic-center">
          <button 
            className={`big-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? (
              <div className="audio-wave">
                <span></span><span></span><span></span><span></span>
              </div>
            ) : (
              <Mic size={36} />
            )}
          </button>
          <span className="mic-caption">
            {isListening ? 'Listening...' : 'Tap Mic & Speak'}
          </span>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div className="transcript-box">
            <p className="transcript-label">Spoken Speech:</p>
            <p className="transcript-text">"{transcript}"</p>
          </div>
        )}

        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Extracted Entity Visualization Card */}
        {parsedData && (
          <div className="detected-card">
            <div className="card-title">
              <Check size={16} className="check-icon" />
              <span>Extracted Intent & Entities</span>
              <span className={`cat-pill ${parsedData.category}`}>
                {parsedData.category === 'KHATA' ? <BookOpen size={12} /> : <Package size={12} />}
                {parsedData.category}
              </span>
            </div>

            <div className="entity-grid">
              <div className="entity-item">
                <span className="entity-label">Intent Action</span>
                <span className={`intent-tag ${parsedData.intent}`}>
                  {parsedData.intent.replace('_', ' ')}
                </span>
              </div>

              {parsedData.category === 'INVENTORY' ? (
                <>
                  <div className="entity-item">
                    <span className="entity-label">Product</span>
                    <span className="entity-value">{parsedData.product}</span>
                  </div>
                  <div className="entity-item">
                    <span className="entity-label">Quantity</span>
                    <span className="entity-value">{parsedData.quantity || '--'}</span>
                  </div>
                  <div className="entity-item">
                    <span className="entity-label">Unit</span>
                    <span className="entity-value">{parsedData.unit || '--'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="entity-item">
                    <span className="entity-label">Customer Name</span>
                    <span className="entity-value">{selectedAmbiguousCustomer ? selectedAmbiguousCustomer.name : parsedData.customerName}</span>
                  </div>
                  {parsedData.amount !== undefined && (
                    <div className="entity-item">
                      <span className="entity-label">Amount (₹)</span>
                      <span className="entity-value emerald">₹{parsedData.amount}</span>
                    </div>
                  )}
                  {parsedData.phone && (
                    <div className="entity-item">
                      <span className="entity-label">Phone</span>
                      <span className="entity-value">{parsedData.phone}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Disambiguation Warning if multiple customer names match */}
            {parsedData.ambiguousCustomers && parsedData.ambiguousCustomers.length > 1 && !selectedAmbiguousCustomer && (
              <div className="disambiguation-box">
                <p className="disamb-title">⚠️ I found multiple customers named "{parsedData.customerName}". Which customer?</p>
                <div className="disamb-chips">
                  {parsedData.ambiguousCustomers.map(c => (
                    <button key={c.id} className="disamb-chip" onClick={() => setSelectedAmbiguousCustomer(c)}>
                      <UserCheck size={14} />
                      <span>{c.name} (Bal: ₹{c.currentBalance})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Delete Warning Modal */}
            {parsedData.intent === 'DELETE_CUSTOMER' && (
              <div className="safety-warning-banner">
                <AlertTriangle size={24} className="amber-icon" />
                <div>
                  <h4>⚠️ Confirm Customer Deletion</h4>
                  <p>You are about to delete <strong>{parsedData.customerName}'s</strong> customer record.</p>
                  <p className="warn-sub">This action will remove all historical ledger entries!</p>
                </div>
              </div>
            )}

            {/* Execution Result Banner */}
            {executionResult && (
              <div className={`result-box ${executionResult.success ? 'success' : 'failed'}`}>
                {executionResult.message}
              </div>
            )}

            {/* Action Buttons */}
            {!executionResult && (
              <div className="action-buttons">
                <button 
                  className={`confirm-btn ${parsedData.intent === 'DELETE_CUSTOMER' ? 'danger' : ''}`} 
                  onClick={handleConfirmAction}
                >
                  <Check size={18} />
                  <span>{parsedData.intent === 'DELETE_CUSTOMER' ? 'Confirm Delete Customer' : 'Confirm Operation'}</span>
                </button>
                <button className="cancel-btn" onClick={() => setParsedData(null)}>
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Multilingual Sample Voice Chips */}
        <div className="presets-section">
          <p className="presets-title">⚡ Try Spoken Samples (Click to Test):</p>
          <div className="preset-chips">
            {PRESET_VOICE_COMMANDS.map((cmd, idx) => (
              <button 
                key={idx} 
                className="preset-chip"
                onClick={() => handleSelectPreset(cmd.text)}
              >
                <span className="chip-badge">{cmd.badge}</span>
                <span className="chip-text">"{cmd.text}"</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .voice-modal-overlay {
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

        .voice-modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
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

        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .voice-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .modal-header h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .status-text {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .mic-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0;
        }

        .big-mic-btn {
          width: 76px;
          height: 76px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
          transition: transform 0.2s;
        }

        .big-mic-btn.listening {
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
          animation: pulseGlow 1.5s infinite;
        }

        .audio-wave {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 30px;
        }

        .audio-wave span {
          width: 4px;
          background: white;
          border-radius: 4px;
          animation: waveBar 1s infinite ease-in-out;
        }

        .mic-caption {
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .transcript-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem 1rem;
          border-radius: 14px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .transcript-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .transcript-text {
          font-size: 1rem;
          font-weight: 600;
          color: #38bdf8;
          margin-top: 0.2rem;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }

        .detected-card {
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .card-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          color: #818cf8;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .cat-pill {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
        }

        .entity-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .entity-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .entity-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .entity-value {
          font-size: 1rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .entity-value.emerald { color: #34d399; }

        .intent-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          text-transform: uppercase;
          width: fit-content;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
        }

        .disambiguation-box {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 0.85rem;
          margin-bottom: 1rem;
        }

        .disamb-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #fbbf24;
          margin-bottom: 0.5rem;
        }

        .disamb-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .disamb-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(15, 23, 42, 0.8);
          color: #f8fafc;
          padding: 0.4rem 0.65rem;
          border-radius: 8px;
          font-size: 0.8rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .safety-warning-banner {
          display: flex;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 12px;
          padding: 0.85rem;
          margin-bottom: 1rem;
          color: #fca5a5;
        }

        .safety-warning-banner h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #f87171;
        }

        .warn-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.2rem;
        }

        .result-box {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .result-box.success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .result-box.failed { background: rgba(239, 68, 68, 0.2); color: #f87171; }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .confirm-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #10b981;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .confirm-btn.danger {
          background: #ef4444;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .presets-section {
          margin-top: 1rem;
        }

        .presets-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .preset-chips {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .preset-chip {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.45rem 0.85rem;
          border-radius: 10px;
          color: #cbd5e1;
          font-size: 0.8rem;
          text-align: left;
        }

        .chip-badge {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

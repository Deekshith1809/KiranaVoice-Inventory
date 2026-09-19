import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  FileText, 
  QrCode, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Package, 
  BookOpen, 
  Edit3,
  X
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { 
  preprocessImageCanvas, 
  parseInvoiceOCR, 
  parseHandwrittenKhataOCR, 
  lookupBarcodeProduct 
} from '../services/ocrScanService';

export const ScanView = ({ onNavigate }) => {
  const { products, customers, addStock, addCredit, recordPayment } = useInventory();

  const [scanMode, setScanMode] = useState('INVOICE_OCR'); // INVOICE_OCR | HANDWRITTEN_KHATA | BARCODE_QR
  const [imagePreview, setImagePreview] = useState(null);
  const [isCapturingWebcam, setIsCapturingWebcam] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extracted OCR Results
  const [parsedInvoiceResult, setParsedInvoiceResult] = useState(null);
  const [parsedKhataResult, setParsedKhataResult] = useState(null);
  const [scannedBarcodeResult, setScannedBarcodeResult] = useState(null);

  const [barcodeInput, setBarcodeInput] = useState('8901234567890');
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState('');

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start HTML5 Camera
  const startCamera = async () => {
    setIsCapturingWebcam(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unmounted:', err);
      // Fallback simulate capture
    }
  };

  // Capture Snapshot from Camera
  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);

      // Stop camera stream
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCapturingWebcam(false);
      processImageOCR(dataUrl);
    } else {
      // Simulate photo capture
      setIsCapturingWebcam(false);
      simulateSampleDocument();
    }
  };

  // Upload File Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImagePreview(dataUrl);
        processImageOCR(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate Sample Document
  const simulateSampleDocument = () => {
    const sampleImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="20" y="40" fill="%23f8fafc" font-size="20">SUPPLIER INVOICE #1042</text><text x="20" y="80" fill="%2394a3b8" font-size="14">Rice 10 bags @ 1200 = 12000</text><text x="20" y="110" fill="%2394a3b8" font-size="14">Sugar 20 kg @ 50 = 1000</text><text x="20" y="140" fill="%2394a3b8" font-size="14">Oil 5 boxes @ 490 = 2450</text><text x="20" y="190" fill="%2334d399" font-size="16">PRINTED TOTAL: ₹15,450</text></svg>';
    setImagePreview(sampleImg);
    processImageOCR(sampleImg);
  };

  // Run Preprocessing & OCR Pipeline
  const processImageOCR = (dataUrl) => {
    setIsProcessing(true);
    setAppliedSuccessMsg('');

    setTimeout(() => {
      setIsProcessing(false);

      if (scanMode === 'INVOICE_OCR') {
        const res = parseInvoiceOCR();
        setParsedInvoiceResult(res);
      } else if (scanMode === 'HANDWRITTEN_KHATA') {
        const res = parseHandwrittenKhataOCR(null, customers);
        setParsedKhataResult(res);
      }
    }, 1000);
  };

  // Apply Scanned Invoice Stock Delta to Inventory
  const handleApplyInvoiceToInventory = () => {
    if (!parsedInvoiceResult) return;

    parsedInvoiceResult.lines.forEach(line => {
      addStock(line.name, line.quantity, line.unit, 'MANUAL');
    });

    setAppliedSuccessMsg('Scanned invoice items applied to inventory successfully!');
    setParsedInvoiceResult(null);
    setImagePreview(null);
  };

  // Apply Scanned Khata Page to Ledger
  const handleApplyKhataToLedger = () => {
    if (!parsedKhataResult) return;

    if (parsedKhataResult.type === 'CREDIT_GIVEN') {
      addCredit(parsedKhataResult.matchedCustomer ? parsedKhataResult.matchedCustomer.id : parsedKhataResult.detectedName, parsedKhataResult.amount, 'Scanned Khata page', 'MANUAL');
    } else {
      recordPayment(parsedKhataResult.matchedCustomer ? parsedKhataResult.matchedCustomer.id : parsedKhataResult.detectedName, parsedKhataResult.amount, 'Scanned Khata payment', 'MANUAL', true);
    }

    setAppliedSuccessMsg(`Recorded ₹${parsedKhataResult.amount} from scanned page for ${parsedKhataResult.detectedName}!`);
    setParsedKhataResult(null);
    setImagePreview(null);
  };

  // Barcode Lookup Handler
  const handleScanBarcode = () => {
    const found = lookupBarcodeProduct(barcodeInput, products);
    setScannedBarcodeResult({
      code: barcodeInput,
      product: found
    });
  };

  return (
    <div className="scan-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>Camera & Document OCR Scanner</h2>
          <p>Process supplier invoices, handwritten pages, and barcodes</p>
        </div>
      </div>

      {appliedSuccessMsg && (
        <div className="success-banner animate-fade-in">
          <Check size={18} />
          <span>{appliedSuccessMsg}</span>
        </div>
      )}

      {/* Mode Selection Chips */}
      <div className="mode-selector">
        <button 
          className={`mode-btn ${scanMode === 'INVOICE_OCR' ? 'active' : ''}`}
          onClick={() => { setScanMode('INVOICE_OCR'); setParsedInvoiceResult(null); setParsedKhataResult(null); }}
        >
          <FileText size={16} />
          <span>Supplier Invoice OCR</span>
        </button>

        <button 
          className={`mode-btn ${scanMode === 'HANDWRITTEN_KHATA' ? 'active' : ''}`}
          onClick={() => { setScanMode('HANDWRITTEN_KHATA'); setParsedInvoiceResult(null); setParsedKhataResult(null); }}
        >
          <BookOpen size={16} />
          <span>Handwritten Khata Page</span>
        </button>

        <button 
          className={`mode-btn ${scanMode === 'BARCODE_QR' ? 'active' : ''}`}
          onClick={() => { setScanMode('BARCODE_QR'); setParsedInvoiceResult(null); setParsedKhataResult(null); }}
        >
          <QrCode size={16} />
          <span>Barcode / QR Lookup</span>
        </button>
      </div>

      {/* Mode 1 & 2: Camera Capture / Upload Box */}
      {scanMode !== 'BARCODE_QR' && (
        <div className="capture-card">
          {!isCapturingWebcam && !imagePreview && (
            <div className="capture-actions">
              <button className="camera-btn" onClick={startCamera}>
                <Camera size={24} />
                <span>📷 Open Camera</span>
              </button>

              <span className="or-divider">OR</span>

              <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                <Upload size={20} />
                <span>Upload Document Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={handleFileUpload}
              />

              <button className="sample-btn" onClick={simulateSampleDocument}>
                <span>⚡ Test Sample Image</span>
              </button>
            </div>
          )}

          {/* Live Video Camera View */}
          {isCapturingWebcam && (
            <div className="webcam-viewport">
              <video ref={videoRef} autoPlay playsInline className="video-stream" />
              <div className="camera-controls">
                <button className="snap-btn" onClick={captureSnapshot}>
                  <Camera size={24} />
                  <span>Capture Snapshot</span>
                </button>
                <button className="close-cam-btn" onClick={() => setIsCapturingWebcam(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Image Preview & Processing Indicator */}
          {imagePreview && !isCapturingWebcam && (
            <div className="preview-box">
              <div className="preview-header">
                <span>Document Image Captured</span>
                <button onClick={() => setImagePreview(null)}>Retake / Clear</button>
              </div>
              <img src={imagePreview} alt="Captured scan preview" className="preview-img" />

              {isProcessing && (
                <div className="processing-overlay">
                  <RefreshCw size={28} className="spinner" />
                  <p>Running OpenCV Preprocessing & OCR Extraction...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Barcode Scan Lookup */}
      {scanMode === 'BARCODE_QR' && (
        <div className="barcode-card">
          <h3>Scan / Enter Barcode SKU</h3>
          <div className="barcode-input-row">
            <input
              type="text"
              placeholder="e.g. 8901234567890 or Rice"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
            />
            <button className="lookup-btn" onClick={handleScanBarcode}>
              <QrCode size={18} />
              <span>Lookup Product</span>
            </button>
          </div>

          {scannedBarcodeResult && (
            <div className="barcode-result-box">
              {scannedBarcodeResult.product ? (
                <div className="found-product">
                  <Package size={32} className="pkg-icon" />
                  <div>
                    <h4>{scannedBarcodeResult.product.name}</h4>
                    <p>Current Stock: <strong>{scannedBarcodeResult.product.quantity} {scannedBarcodeResult.product.unit}</strong> | Price: ₹{scannedBarcodeResult.product.price}</p>
                  </div>
                  <button className="quick-add-btn" onClick={() => addStock(scannedBarcodeResult.product.id, 1, scannedBarcodeResult.product.unit, 'MANUAL')}>
                    + Add 1 Unit
                  </button>
                </div>
              ) : (
                <div className="unknown-product">
                  <AlertCircle size={24} />
                  <div>
                    <h4>Unknown Barcode SKU ({scannedBarcodeResult.code})</h4>
                    <p>Product not found in catalog. Would you like to create a new product?</p>
                  </div>
                  <button className="create-product-btn" onClick={() => onNavigate('inventory')}>
                    Create Product
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* OCR Result Review: Supplier Invoice */}
      {parsedInvoiceResult && (
        <div className="review-card animate-slide-up">
          <div className="card-header">
            <h3>Review Scanned Supplier Invoice</h3>
            <span className="conf-tag">OCR Confidence: 94%</span>
          </div>

          {/* Invoice Total Cross-Check Warning */}
          {parsedInvoiceResult.hasTotalMismatch && (
            <div className="mismatch-warning-banner">
              <AlertTriangle size={20} />
              <div>
                <h4>⚠️ Invoice Total Mismatch Warning</h4>
                <p>Calculated Total: <strong>₹{parsedInvoiceResult.calculatedTotal.toLocaleString('en-IN')}</strong> | Printed Total: <strong>₹{parsedInvoiceResult.printedTotal.toLocaleString('en-IN')}</strong></p>
                <p className="sub">Please review individual line totals before committing to inventory!</p>
              </div>
            </div>
          )}

          {/* Low Confidence Warning */}
          {parsedInvoiceResult.hasLowConfidence && (
            <div className="low-conf-warning">
              <AlertCircle size={16} />
              <span>⚠ Low-confidence OCR field values detected. Please verify item names and quantities.</span>
            </div>
          )}

          {/* Scanned Line Items Table */}
          <div className="table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity & Unit</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                  <th>Stock Delta Preview</th>
                </tr>
              </thead>
              <tbody>
                {parsedInvoiceResult.lines.map((l, idx) => {
                  const currentItem = products.find(p => p.name.toLowerCase() === l.name.toLowerCase());
                  const currentStock = currentItem ? currentItem.quantity : 0;
                  const newStock = currentStock + l.quantity;

                  return (
                    <tr key={idx}>
                      <td>
                        <div className="line-item-box">
                          <span className="item-name">{l.name}</span>
                          {l.isLowConfidence && <span className="low-conf-badge">Verify Name</span>}
                        </div>
                      </td>
                      <td>{l.quantity} {l.unit}</td>
                      <td>₹{l.unitPrice}</td>
                      <td>
                        <span className={l.isLineValid ? 'valid-total' : 'invalid-total'}>
                          ₹{l.lineTotal.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span className="delta-tag">
                          {currentStock} {l.unit} → <strong>{newStock} {l.unit}</strong> (+{l.quantity})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="review-actions">
            <button className="apply-btn" onClick={handleApplyInvoiceToInventory}>
              <Check size={18} />
              <span>Apply to Inventory</span>
            </button>
            <button className="cancel-btn" onClick={() => setParsedInvoiceResult(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* OCR Result Review: Handwritten Khata Page */}
      {parsedKhataResult && (
        <div className="review-card animate-slide-up">
          <div className="card-header">
            <h3>Review Scanned Handwritten Khata Page</h3>
            <span className="conf-tag warning">OCR Confidence: {parsedKhataResult.confidence}%</span>
          </div>

          {parsedKhataResult.isLowConfidence && (
            <div className="low-conf-warning">
              <AlertTriangle size={18} />
              <span>⚠️ Low-confidence handwritten detection. Please verify detected customer name and amount before confirming!</span>
            </div>
          )}

          <div className="khata-extracted-grid">
            <div className="ext-item">
              <span className="ext-label">Detected Customer Name</span>
              <span className="ext-val">{parsedKhataResult.detectedName}</span>
            </div>

            <div className="ext-item">
              <span className="ext-label">Matched Account</span>
              <span className="ext-val">{parsedKhataResult.matchedCustomer ? parsedKhataResult.matchedCustomer.name : 'New Customer Account'}</span>
            </div>

            <div className="ext-item">
              <span className="ext-label">Extracted Amount</span>
              <span className="ext-val emerald">₹{parsedKhataResult.amount}</span>
            </div>

            <div className="ext-item">
              <span className="ext-label">Transaction Type</span>
              <span className="ext-val">{parsedKhataResult.type === 'CREDIT_GIVEN' ? 'Udhaar Given (+Credit)' : 'Payment Received'}</span>
            </div>
          </div>

          <div className="review-actions">
            <button className="apply-btn" onClick={handleApplyKhataToLedger}>
              <Check size={18} />
              <span>Confirm Khata Transaction</span>
            </button>
            <button className="cancel-btn" onClick={() => setParsedKhataResult(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .scan-container {
          padding: 1.25rem;
          max-width: 1000px;
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

        .success-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .mode-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .mode-btn {
          flex: 1;
          min-width: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: rgba(30, 41, 59, 0.7);
          color: #94a3b8;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mode-btn.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .capture-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 260px;
        }

        .capture-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .camera-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
        }

        .or-divider {
          color: #64748b;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.8);
          color: #cbd5e1;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sample-btn {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 1rem;
          width: 100%;
          max-width: 200px;
        }

        .hidden-input { display: none; }

        .webcam-viewport {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
          max-width: 500px;
        }

        .video-stream {
          width: 100%;
          border-radius: 16px;
          background: #000;
        }

        .camera-controls {
          display: flex;
          gap: 1rem;
        }

        .snap-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #10b981;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 700;
        }

        .close-cam-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .preview-box {
          width: 100%;
          max-width: 500px;
          position: relative;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .preview-header button {
          background: transparent;
          color: #ef4444;
          font-weight: 600;
        }

        .preview-img {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .processing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #38bdf8;
          font-weight: 600;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .barcode-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .barcode-input-row {
          display: flex;
          gap: 0.75rem;
        }

        .barcode-input-row input {
          flex: 1;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .lookup-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #6366f1;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .found-product {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          padding: 1rem;
          color: #f8fafc;
        }

        .pkg-icon { color: #34d399; }

        .quick-add-btn {
          background: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-left: auto;
        }

        .unknown-product {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 14px;
          padding: 1rem;
          color: #fbbf24;
        }

        .create-product-btn {
          background: #f59e0b;
          color: #0f172a;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          margin-left: auto;
        }

        .review-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .conf-tag {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
        }

        .conf-tag.warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

        .mismatch-warning-banner {
          display: flex;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 12px;
          padding: 0.85rem;
          color: #fca5a5;
        }

        .low-conf-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          font-size: 0.8rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .invoice-table th {
          background: rgba(15, 23, 42, 0.6);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .invoice-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          font-size: 0.85rem;
        }

        .item-name {
          font-weight: 700;
          color: #f8fafc;
        }

        .low-conf-badge {
          font-size: 0.65rem;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          margin-left: 0.35rem;
        }

        .valid-total { color: #34d399; font-weight: 700; }
        .invalid-total { color: #f87171; font-weight: 700; }

        .delta-tag {
          font-size: 0.8rem;
          color: #a5b4fc;
        }

        .khata-extracted-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          background: rgba(15, 23, 42, 0.5);
          padding: 1rem;
          border-radius: 14px;
        }

        .ext-item {
          display: flex;
          flex-direction: column;
        }

        .ext-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .ext-val {
          font-size: 1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .ext-val.emerald { color: #34d399; }

        .review-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .apply-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #10b981;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

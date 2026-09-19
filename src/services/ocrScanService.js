// Camera & OCR Image Processing Engine

export const MOCK_SCANNED_INVOICE = {
  printedTotal: 15450,
  confidence: 94,
  lines: [
    { name: 'Rice', quantity: 10, unit: 'Bags', unitPrice: 1200, lineTotal: 12000, confidence: 98 },
    { name: 'Sugar', quantity: 20, unit: 'Kg', unitPrice: 50, lineTotal: 1000, confidence: 94 },
    { name: 'Oil', quantity: 5, unit: 'Boxes', unitPrice: 490, lineTotal: 2450, confidence: 89 }
  ]
};

export const MOCK_HANDWRITTEN_KHATA = {
  customerName: 'Ramesh',
  amount: 500,
  type: 'CREDIT_GIVEN',
  confidence: 76, // Low confidence example triggering safety warning!
  detectedText: 'Ramesh - 500 udhaar'
};

/**
 * Image Preprocessing (OpenCV pipeline simulation)
 */
export function preprocessImageCanvas(imageElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = imageElement.width || 640;
  canvas.height = imageElement.height || 480;

  // 1. Draw Image
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  // 2. Grayscale & Contrast Enhancement
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Contrast boost
    const enhanced = avg > 128 ? Math.min(255, avg * 1.1) : Math.max(0, avg * 0.9);
    data[i] = enhanced;     // R
    data[i + 1] = enhanced; // G
    data[i + 2] = enhanced; // B
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg');
}

/**
 * OCR Invoice Line Item Parser with Per-Line and Total Cross-Check
 */
export function parseInvoiceOCR(ocrRawResult = null) {
  const invoice = ocrRawResult || MOCK_SCANNED_INVOICE;

  // Per-line total validation
  const validatedLines = invoice.lines.map(line => {
    const calculatedLineTotal = line.quantity * line.unitPrice;
    return {
      ...line,
      calculatedLineTotal,
      isLineValid: calculatedLineTotal === line.lineTotal,
      isLowConfidence: line.confidence < 80
    };
  });

  // Invoice Total Cross-Check
  const calculatedInvoiceTotal = validatedLines.reduce((acc, l) => acc + l.calculatedLineTotal, 0);
  const hasTotalMismatch = calculatedInvoiceTotal !== invoice.printedTotal;
  const hasLowConfidence = validatedLines.some(l => l.isLowConfidence) || invoice.confidence < 80;

  return {
    printedTotal: invoice.printedTotal,
    calculatedTotal: calculatedInvoiceTotal,
    hasTotalMismatch,
    hasLowConfidence,
    lines: validatedLines
  };
}

/**
 * Handwritten Khata Page Parser
 */
export function parseHandwrittenKhataOCR(ocrRawResult = null, customerList = []) {
  const khataData = ocrRawResult || MOCK_HANDWRITTEN_KHATA;
  
  // Find customer match
  const searchName = khataData.customerName;
  const matchResult = customerList.find(
    c => c.name.toLowerCase() === searchName.toLowerCase()
  );

  return {
    detectedName: searchName,
    matchedCustomer: matchResult || null,
    amount: khataData.amount,
    type: khataData.type,
    confidence: khataData.confidence,
    isLowConfidence: khataData.confidence < 80
  };
}

/**
 * Barcode & QR Code Scanner Lookup
 */
export function lookupBarcodeProduct(barcodeValue, catalog = []) {
  if (!barcodeValue) return null;

  // Standard barcode catalog lookup
  const found = catalog.find(
    p => p.barcode === barcodeValue || p.id === barcodeValue || p.name.toLowerCase() === barcodeValue.toLowerCase()
  );

  return found || null;
}

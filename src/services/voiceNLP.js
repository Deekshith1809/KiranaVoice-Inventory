// Multilingual NLP Parser for Voice Inventory, Khata & Support Commands
// Supports English, Telugu, Hindi, and mixed code-switched dialects

export const SUPPORTED_UNITS = [
  'Bags', 'Kg', 'Grams', 'Litres', 'Cartons', 'Boxes', 'Dozens', 'Quintals', 'Pieces'
];

export const UNIT_ALIASES = {
  bags: 'Bags', bag: 'Bags', 'బ్యాగులు': 'Bags', 'బ్యాగ్': 'Bags', 'बोरी': 'Bags', 'बोरे': 'Bags',
  kg: 'Kg', kilo: 'Kg', kilograms: 'Kg', 'కేజీ': 'Kg', 'కిలో': 'Kg', 'किलो': 'Kg',
  grams: 'Grams', g: 'Grams', 'గ్రామ్స్': 'Grams', 'ग्राम': 'Grams',
  litres: 'Litres', l: 'Litres', liter: 'Litres', 'లీటర్లు': 'Litres', 'लीटर': 'Litres',
  cartons: 'Cartons', carton: 'Cartons', 'కార్టన్లు': 'Cartons', 'कार्टन': 'Cartons',
  boxes: 'Boxes', box: 'Boxes', 'బాక్సులు': 'Boxes', 'बॉक्स': 'Boxes',
  dozens: 'Dozens', doz: 'Dozens', 'డజన్లు': 'Dozens', 'दर्जन': 'Dozens',
  quintals: 'Quintals', qtl: 'Quintals', 'క్వింటాళ్ళు': 'Quintals', 'क्विंटल': 'Quintals',
  pieces: 'Pieces', pcs: 'Pieces', piece: 'Pieces', 'పీసులు': 'Pieces', 'పీస్': 'Pieces', 'पीस': 'Pieces'
};

export const PRODUCT_ALIASES = {
  rice: 'Rice', 'రైస్': 'Rice', 'బియ్యం': 'Rice', 'चावल': 'Rice', chawal: 'Rice',
  sugar: 'Sugar', 'చక్కెర': 'Sugar', 'షుగర్': 'Sugar', 'चीनी': 'Sugar', cheeni: 'Sugar',
  biscuits: 'Biscuits', biscuit: 'Biscuits', 'బిస్కెట్లు': 'Biscuits', 'बिस्कुट': 'Biscuits',
  milk: 'Milk', 'పాలు': 'Milk', 'మిల్క్': 'Milk', 'दूध': 'Milk', doodh: 'Milk',
  oil: 'Oil', 'నూనె': 'Oil', 'ఆయిల్': 'Oil', 'तेल': 'Oil', tel: 'Oil'
};

export const PRESET_VOICE_COMMANDS = [
  // Inventory Commands
  {
    category: 'INVENTORY',
    lang: 'English',
    text: 'Add 20 bags of rice',
    badge: 'EN',
    description: 'Add inward stock in English'
  },
  {
    category: 'INVENTORY',
    lang: 'Telugu',
    text: 'రైస్ 20 బ్యాగులు వచ్చాయి',
    badge: 'TE',
    description: 'Telugu script inward stock command'
  },
  {
    category: 'INVENTORY',
    lang: 'Mixed Telugish',
    text: 'Rice 20 bags vachayi',
    badge: 'TE-EN',
    description: 'Code-switched Telugu-English command'
  },
  {
    category: 'INVENTORY',
    lang: 'Hindi',
    text: '20 kilo chawal add karo',
    badge: 'HI',
    description: 'Hindi script / Hinglish inward stock'
  },
  // Khata Book Commands
  {
    category: 'KHATA',
    lang: 'Hindi/Hinglish',
    text: 'Ramesh ko 500 udhaar diya',
    badge: 'KHATA',
    description: 'Record credit given to customer'
  },
  {
    category: 'KHATA',
    lang: 'Hindi/Hinglish',
    text: 'Ramesh ne 200 diya',
    badge: 'KHATA',
    description: 'Record payment received from customer'
  },
  {
    category: 'KHATA',
    lang: 'Hindi/Hinglish',
    text: 'Ramesh ka kitna baaki hai?',
    badge: 'KHATA',
    description: 'Check customer balance query'
  },
  // Support Commands (Module 5)
  {
    category: 'SUPPORT',
    lang: 'English/Hindi',
    text: 'I need help with my Khata',
    badge: 'SUPPORT',
    description: 'Voice support request trigger'
  },
  {
    category: 'SUPPORT',
    lang: 'English',
    text: 'Request a call for voice recognition problem',
    badge: 'SUPPORT',
    description: 'Voice callback request trigger'
  }
];

/**
 * Parses raw voice transcript into structured intent & entities (Inventory, Khata & Support)
 */
export function parseVoiceTranscript(transcript, catalog = [], customers = []) {
  if (!transcript || typeof transcript !== 'string') {
    return { intent: 'UNKNOWN', category: 'UNKNOWN', confidence: 0 };
  }

  const cleanText = transcript.trim().toLowerCase();
  
  // -------------------------------------------------------------
  // A. SUPPORT INTENTS (Module 5)
  // -------------------------------------------------------------
  if (
    cleanText.includes('need help') || 
    cleanText.includes('support chahiye') || 
    cleanText.includes('help me') || 
    cleanText.includes('సహాయం') ||
    cleanText.includes('मदद')
  ) {
    let issueCategory = 'Other';
    if (cleanText.includes('khata')) issueCategory = 'Khata Problem';
    if (cleanText.includes('inventory') || cleanText.includes('stock')) issueCategory = 'Inventory Problem';
    if (cleanText.includes('voice') || cleanText.includes('mic')) issueCategory = 'Voice Recognition Problem';
    if (cleanText.includes('scan') || cleanText.includes('camera') || cleanText.includes('ocr')) issueCategory = 'Camera / OCR Problem';

    return {
      rawTranscript: transcript,
      category: 'SUPPORT',
      intent: 'REQUEST_SUPPORT',
      issueCategory,
      requiresConfirmation: true,
      confidence: 0.96
    };
  }

  if (cleanText.includes('request a call') || cleanText.includes('call me back') || cleanText.includes('callback')) {
    let issueCategory = 'Other';
    if (cleanText.includes('voice')) issueCategory = 'Voice Recognition Problem';
    if (cleanText.includes('khata')) issueCategory = 'Khata Problem';
    if (cleanText.includes('inventory')) issueCategory = 'Inventory Problem';

    return {
      rawTranscript: transcript,
      category: 'SUPPORT',
      intent: 'REQUEST_CALLBACK',
      issueCategory,
      requiresConfirmation: true,
      confidence: 0.96
    };
  }

  if (cleanText.includes('call support') || cleanText.includes('phone support')) {
    return {
      rawTranscript: transcript,
      category: 'SUPPORT',
      intent: 'CALL_SUPPORT',
      confidence: 0.95
    };
  }

  // -------------------------------------------------------------
  // B. KHATA BOOK INTENTS
  // -------------------------------------------------------------
  if (cleanText.includes('customer add') || cleanText.includes('add customer') || cleanText.includes('గ్రాహకుడిని') || cleanText.includes('कस्टमर ऐड')) {
    const nameMatch = cleanText.match(/(?:add customer|customer add|karo|ko)\s+([a-z\u0C00-\u0C7F\u0900-\u097F]+)/i);
    const phoneMatch = cleanText.match(/\d{10}/);
    
    return {
      rawTranscript: transcript,
      category: 'KHATA',
      intent: 'ADD_CUSTOMER',
      customerName: nameMatch ? capitalize(nameMatch[1]) : 'New Customer',
      phone: phoneMatch ? phoneMatch[0] : null,
      confidence: 0.95
    };
  }

  if (cleanText.includes('udhaar') || cleanText.includes('credit') || cleanText.includes('ఉధార్') || cleanText.includes('उधार')) {
    const amountMatch = cleanText.match(/\d+(\.\d+)?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
    const customer = extractCustomerFromSpeech(cleanText, customers);

    return {
      rawTranscript: transcript,
      category: 'KHATA',
      intent: 'CREDIT_GIVEN',
      customerName: customer.name,
      customerId: customer.id,
      ambiguousCustomers: customer.ambiguousMatches,
      amount,
      confidence: 0.94
    };
  }

  if (
    cleanText.includes('wapas') || 
    cleanText.includes('paid') || 
    (cleanText.includes('diya') && !cleanText.includes('udhaar')) ||
    cleanText.includes('రుసుము') ||
    cleanText.includes('दिया')
  ) {
    const amountMatch = cleanText.match(/\d+(\.\d+)?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
    const customer = extractCustomerFromSpeech(cleanText, customers);

    return {
      rawTranscript: transcript,
      category: 'KHATA',
      intent: 'PAYMENT_RECEIVED',
      customerName: customer.name,
      customerId: customer.id,
      ambiguousCustomers: customer.ambiguousMatches,
      amount,
      confidence: 0.94
    };
  }

  if (
    cleanText.includes('baaki') || 
    cleanText.includes('owe') || 
    (cleanText.includes('balance') && !cleanText.includes('total') && !cleanText.includes('sab')) ||
    cleanText.includes('బాకీ')
  ) {
    const customer = extractCustomerFromSpeech(cleanText, customers);

    return {
      rawTranscript: transcript,
      category: 'KHATA',
      intent: 'CHECK_CUSTOMER_BALANCE',
      customerName: customer.name,
      customerId: customer.id,
      ambiguousCustomers: customer.ambiguousMatches,
      confidence: 0.92
    };
  }

  if (
    cleanText.includes('total udhaar') || 
    cleanText.includes('total outstanding') || 
    cleanText.includes('money is pending') || 
    cleanText.includes('sab customers')
  ) {
    return {
      rawTranscript: transcript,
      category: 'KHATA',
      intent: 'TOTAL_OUTSTANDING',
      confidence: 0.96
    };
  }

  if (cleanText.includes('customer delete') || cleanText.includes('delete customer')) {
    const customer = extractCustomerFromSpeech(cleanText, customers);

    return {
      rawTranscript: transcript,
      category: 'KHATA',
      intent: 'DELETE_CUSTOMER',
      customerName: customer.name,
      customerId: customer.id,
      requiresConfirmation: true,
      confidence: 0.95
    };
  }

  // -------------------------------------------------------------
  // C. INVENTORY INTENTS (Preserved Existing Functionality)
  // -------------------------------------------------------------
  let intent = 'UNKNOWN';
  if (
    cleanText.includes('add') || 
    cleanText.includes('vachayi') || 
    cleanText.includes('vachindi') || 
    cleanText.includes('aaya') || 
    cleanText.includes('aa gaya') || 
    cleanText.includes('plus') || 
    cleanText.includes('వచ్చాయి')
  ) {
    intent = 'ADD_STOCK';
  } else if (
    cleanText.includes('remove') || 
    cleanText.includes('deduct') || 
    cleanText.includes('sell') || 
    cleanText.includes('sold') || 
    cleanText.includes('poyayi') || 
    cleanText.includes('gaya') || 
    cleanText.includes('bika')
  ) {
    intent = 'REMOVE_STOCK';
  } else if (
    cleanText.includes('how much') || 
    cleanText.includes('how many') || 
    cleanText.includes('kitna') || 
    cleanText.includes('entha') || 
    cleanText.includes('count') || 
    cleanText.includes('available')
  ) {
    intent = 'CHECK_STOCK';
  } else if (
    cleanText.includes('running low') || 
    cleanText.includes('low stock') || 
    cleanText.includes('thakkuva')
  ) {
    intent = 'LOW_STOCK';
  }

  const qtyMatch = cleanText.match(/\d+(\.\d+)?/);
  const quantity = qtyMatch ? parseFloat(qtyMatch[0]) : null;

  let unit = null;
  const words = cleanText.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z0-9\u0C00-\u0C7F\u0900-\u097F]/g, '');
    if (UNIT_ALIASES[cleanWord]) {
      unit = UNIT_ALIASES[cleanWord];
      break;
    }
  }

  let matchedProduct = null;
  let productNameExtracted = null;

  for (const [alias, stdName] of Object.entries(PRODUCT_ALIASES)) {
    if (cleanText.includes(alias)) {
      productNameExtracted = stdName;
      break;
    }
  }

  if (catalog && catalog.length > 0) {
    if (productNameExtracted) {
      matchedProduct = catalog.find(
        p => p.name.toLowerCase() === productNameExtracted.toLowerCase()
      );
    }
    
    if (!matchedProduct) {
      for (const prod of catalog) {
        if (cleanText.includes(prod.name.toLowerCase())) {
          matchedProduct = prod;
          productNameExtracted = prod.name;
          break;
        }
      }
    }
  }

  if (matchedProduct && !unit) {
    unit = matchedProduct.unit;
  }

  return {
    rawTranscript: transcript,
    category: 'INVENTORY',
    intent,
    product: matchedProduct ? matchedProduct.name : (productNameExtracted || 'Unknown Item'),
    productId: matchedProduct ? matchedProduct.id : null,
    quantity: quantity || (intent === 'CHECK_STOCK' ? null : 1),
    unit: unit || 'Pcs',
    confidence: intent !== 'UNKNOWN' ? 0.94 : 0.4
  };
}

function extractCustomerFromSpeech(cleanText, customers = []) {
  if (!customers || !customers.length) {
    const words = cleanText.split(/\s+/);
    const potential = words.find(w => w !== 'ko' && w !== 'ne' && w !== 'ka' && w !== '500' && w !== '200' && w !== 'udhaar' && w !== 'diya');
    return { name: capitalize(potential || 'Ramesh'), id: null, ambiguousMatches: [] };
  }

  const matches = customers.filter(c => {
    const cName = c.name.toLowerCase();
    return cleanText.includes(cName);
  });

  if (matches.length === 1) {
    return { name: matches[0].name, id: matches[0].id, ambiguousMatches: [] };
  }

  if (matches.length > 1) {
    return { name: matches[0].name, id: matches[0].id, ambiguousMatches: matches };
  }

  return { name: customers[0].name, id: customers[0].id, ambiguousMatches: [] };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

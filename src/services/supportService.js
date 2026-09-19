// Support & Onboarding Service

export const SUPPORT_PHONE_NUMBER = '+91 1800-123-4567';

export const SUPPORT_CATEGORIES = [
  'Inventory Problem',
  'Voice Recognition Problem',
  'Khata Problem',
  'Camera / OCR Problem',
  'Login / Account Problem',
  'Language Problem',
  'Payment / Subscription',
  'Technical Problem',
  'Other'
];

export const INITIAL_USER_PROFILE = {
  id: 'usr-1',
  shopId: 'shop-1',
  name: 'Ramesh Kumar',
  shopName: 'Ramesh Kirana Stores',
  phone: '+91 9876543210',
  email: 'ramesh.kirana@gmail.com',
  preferredLanguage: 'en',
  onboardingCompleted: false // Shows first-time onboarding wizard
};

export const INITIAL_CALLBACK_REQUESTS = [
  {
    id: 'req-1',
    requestId: 'SUP-000123',
    shopId: 'shop-1',
    name: 'Ramesh Kumar',
    phone: '+91 9876543210',
    category: 'Voice Recognition Problem',
    description: 'Telugu voice commands for rice bags are not recognizing quantity properly.',
    preferredLanguage: 'te',
    status: 'Pending',
    assignedAgentId: null,
    internalNotes: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    resolvedAt: null
  },
  {
    id: 'req-2',
    requestId: 'SUP-000124',
    shopId: 'shop-2',
    name: 'Suresh Traders',
    phone: '+91 9812345678',
    category: 'Khata Problem',
    description: 'Overdue customer days counter question.',
    preferredLanguage: 'en',
    status: 'Assigned',
    assignedAgentId: 'agent-4',
    internalNotes: 'Contacted agent Rahul to review customer balance dates.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    resolvedAt: null
  },
  {
    id: 'req-3',
    requestId: 'SUP-000125',
    shopId: 'shop-3',
    name: 'Mahesh Mandi',
    phone: '+91 9700112233',
    category: 'Login / Account Problem',
    description: 'Changed SIM card, needed assistance updating phone number.',
    preferredLanguage: 'hi',
    status: 'Resolved',
    assignedAgentId: 'agent-2',
    internalNotes: 'Phone number updated successfully and verified via SMS OTP.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
];

export const INITIAL_SUPPORT_TICKETS = [
  {
    id: 'tkt-1',
    ticketId: 'TKT-000451',
    shopId: 'shop-1',
    name: 'Ramesh Kumar',
    email: 'ramesh.kirana@gmail.com',
    phone: '+91 9876543210',
    category: 'Camera / OCR Problem',
    subject: 'Camera / OCR Problem - Invoice scan question',
    description: 'Can I scan supplier invoices written in regional languages?',
    status: 'Open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

export const FAQ_ITEMS = [
  {
    category: 'Inventory',
    question: 'How do I add or deduct stock by speaking?',
    answer: 'Tap the prominent "🎤 Speak to Manage Stock" button and speak naturally, e.g. "Add 20 bags of rice" or "Rice 20 bags vachayi". Verify the extracted entities on the confirmation card and tap Confirm.'
  },
  {
    category: 'Inventory',
    question: 'How do low-stock alerts work?',
    answer: 'Each product has a configurable Reorder Level threshold. When product stock drops below this number, it automatically appears in the Low Stock Alerts section with a 1-tap reorder button.'
  },
  {
    category: 'Khata Book',
    question: 'How do I record Udhaar (Credit) or Payments?',
    answer: 'Go to the Khata Book tab and tap "+ Udhaar" or "- Payment" next to any customer. You can also use voice, e.g. "Ramesh ko 500 udhaar diya" or "Ramesh ne 200 diya".'
  },
  {
    category: 'Khata Book',
    question: 'How do I generate a PDF statement for a customer?',
    answer: 'Open the Khata Book tab, click "Ledger" next to any customer, and tap "Export Khata PDF". A clean, printable statement will be generated with all itemized entries and current balance.'
  },
  {
    category: 'Camera / Scan',
    question: 'How does Invoice OCR total cross-checking work?',
    answer: 'When you scan an invoice, the system multiplies quantity by unit price for every line item. If the calculated total does not match the printed invoice total, a warning alert asks you to review before applying.'
  },
  {
    category: 'Account',
    question: 'How do I change my registered phone number?',
    answer: 'Tap the Floating Help button (?), select "Request a Call", and tap "Edit" next to your phone number. Enter your new number and tap Save.'
  }
];

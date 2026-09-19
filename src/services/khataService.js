// Khata Customer Credit Ledger Service

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Ramesh',
    phone: '9876543210',
    currentBalance: 1300,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'cust-2',
    name: 'Suresh',
    phone: '9812345678',
    currentBalance: 1200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(), // 42 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'cust-3',
    name: 'Mahesh',
    phone: '9700112233',
    currentBalance: 800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString(), // 31 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  },
  {
    id: 'cust-4',
    name: 'Priya',
    phone: '9988776655',
    currentBalance: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

export const INITIAL_KHATA_TRANSACTIONS = [
  {
    id: 'ktx-1',
    customerId: 'cust-1',
    customerName: 'Ramesh',
    type: 'CREDIT_GIVEN',
    amount: 1000,
    balanceAfter: 1000,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    notes: 'Grain purchases',
    source: 'MANUAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
  },
  {
    id: 'ktx-2',
    customerId: 'cust-1',
    customerName: 'Ramesh',
    type: 'PAYMENT_RECEIVED',
    amount: 200,
    balanceAfter: 800,
    dueDate: null,
    notes: 'Cash payment',
    source: 'VOICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
  },
  {
    id: 'ktx-3',
    customerId: 'cust-1',
    customerName: 'Ramesh',
    type: 'CREDIT_GIVEN',
    amount: 500,
    balanceAfter: 1300,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    notes: 'Biscuits & Oil',
    source: 'VOICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'ktx-4',
    customerId: 'cust-2',
    customerName: 'Suresh',
    type: 'CREDIT_GIVEN',
    amount: 1200,
    balanceAfter: 1200,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    notes: 'Grocery items',
    source: 'MANUAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString()
  },
  {
    id: 'ktx-5',
    customerId: 'cust-3',
    customerName: 'Mahesh',
    type: 'CREDIT_GIVEN',
    amount: 800,
    balanceAfter: 800,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    notes: 'Milk & Sugar',
    source: 'VOICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString()
  }
];

/**
 * Fuzzy Customer Matcher (RapidFuzz equivalent)
 */
export function findMatchingCustomers(searchName, customerList = []) {
  if (!searchName || !customerList.length) return { exactMatch: null, matches: [] };

  const cleanQuery = searchName.toLowerCase().replace(/\b(bhai|ji|anna|customer|ko|ne|ka)\b/g, '').trim();

  const exact = customerList.find(c => c.name.toLowerCase() === cleanQuery);
  if (exact) return { exactMatch: exact, matches: [exact] };

  // Fuzzy partial match
  const matches = customerList.filter(c => {
    const cName = c.name.toLowerCase();
    return cName.includes(cleanQuery) || cleanQuery.includes(cName);
  });

  return {
    exactMatch: matches.length === 1 ? matches[0] : null,
    matches
  };
}

/**
 * PDF / Printable Khata Statement Generator
 */
export function printKhataPDF(customer, transactions = [], shopName = 'KiranaVoice Shop') {
  const custTx = transactions.filter(t => t.customerId === customer.id);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Khata Statement - ${customer.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; color: #1e293b; }
        .header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #6366f1; padding-bottom: 1rem; }
        .header h1 { margin: 0; color: #4f46e5; }
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-size: 0.85rem; text-transform: uppercase; color: #64748b; }
        .credit { color: #dc2626; font-weight: bold; }
        .payment { color: #16a34a; font-weight: bold; }
        .total-box { text-align: right; font-size: 1.25rem; font-weight: bold; background: #e0e7ff; padding: 1rem; border-radius: 8px; color: #3730a3; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${shopName}</h1>
        <p>Customer Credit Ledger (Khata Book Statement)</p>
      </div>

      <div class="info-grid">
        <div>
          <strong>Customer Name:</strong> ${customer.name}<br/>
          <strong>Phone:</strong> ${customer.phone || 'N/A'}
        </div>
        <div>
          <strong>Date Generated:</strong> ${new Date().toLocaleDateString()}<br/>
          <strong>Total Entries:</strong> ${custTx.length}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Source</th>
            <th>Notes</th>
            <th>Amount</th>
            <th>Balance After</th>
          </tr>
        </thead>
        <tbody>
          ${custTx.map(t => `
            <tr>
              <td>${new Date(t.createdAt).toLocaleDateString()}</td>
              <td class="${t.type === 'CREDIT_GIVEN' ? 'credit' : 'payment'}">
                ${t.type === 'CREDIT_GIVEN' ? 'Udhaar Given' : 'Payment Received'}
              </td>
              <td>${t.source}</td>
              <td>${t.notes || '-'}</td>
              <td class="${t.type === 'CREDIT_GIVEN' ? 'credit' : 'payment'}">
                ${t.type === 'CREDIT_GIVEN' ? '+' : '-'}₹${t.amount}
              </td>
              <td>₹${t.balanceAfter}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-box">
        Outstanding Balance Due: ₹${customer.currentBalance}
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

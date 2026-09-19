import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_KHATA_TRANSACTIONS } from '../services/khataService';
import { 
  INITIAL_USER_PROFILE, 
  INITIAL_CALLBACK_REQUESTS, 
  INITIAL_SUPPORT_TICKETS 
} from '../services/supportService';

const InventoryContext = createContext();

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Rice',
    category: 'Grains & Pulses',
    quantity: 45,
    unit: 'Bags',
    price: 1400,
    reorderLevel: 10,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Sugar',
    category: 'Groceries',
    quantity: 70,
    unit: 'Kg',
    price: 45,
    reorderLevel: 20,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Biscuits',
    category: 'Snacks & Bakery',
    quantity: 8,
    unit: 'Cartons',
    price: 650,
    reorderLevel: 10,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Milk',
    category: 'Dairy',
    quantity: 25,
    unit: 'Litres',
    price: 55,
    reorderLevel: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Oil',
    category: 'Edible Oils',
    quantity: 12,
    unit: 'Boxes',
    price: 1800,
    reorderLevel: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    productId: 'prod-1',
    productName: 'Rice',
    type: 'IN',
    quantity: 50,
    unit: 'Bags',
    price: 1400,
    source: 'VOICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  },
  {
    id: 'tx-2',
    productId: 'prod-1',
    productName: 'Rice',
    type: 'OUT',
    quantity: 5,
    unit: 'Bags',
    price: 1400,
    source: 'VOICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

export const InventoryProvider = ({ children }) => {
  // Inventory State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('voice_inv_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('voice_inv_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Khata State
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('voice_khata_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [khataTransactions, setKhataTransactions] = useState(() => {
    const saved = localStorage.getItem('voice_khata_transactions');
    return saved ? JSON.parse(saved) : INITIAL_KHATA_TRANSACTIONS;
  });

  // User Profile & Support State (Module 5)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('voice_user_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [callbackRequests, setCallbackRequests] = useState(() => {
    const saved = localStorage.getItem('voice_callback_requests');
    return saved ? JSON.parse(saved) : INITIAL_CALLBACK_REQUESTS;
  });

  const [supportTickets, setSupportTickets] = useState(() => {
    const saved = localStorage.getItem('voice_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  // App Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('voice_inv_settings');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      appLanguage: 'en',
      speechLanguage: 'te-IN',
      soundEnabled: true,
      overdueDaysThreshold: 30,
      customUnits: ['Bags', 'Kg', 'Grams', 'Litres', 'Cartons', 'Boxes', 'Dozens', 'Quintals', 'Pieces']
    };
  });

  useEffect(() => {
    localStorage.setItem('voice_inv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('voice_inv_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('voice_khata_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('voice_khata_transactions', JSON.stringify(khataTransactions));
  }, [khataTransactions]);

  useEffect(() => {
    localStorage.setItem('voice_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('voice_callback_requests', JSON.stringify(callbackRequests));
  }, [callbackRequests]);

  useEffect(() => {
    localStorage.setItem('voice_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('voice_inv_settings', JSON.stringify(settings));
  }, [settings]);

  // Inventory Actions
  const logTransaction = (productId, productName, type, quantity, unit, price = 0, source = 'MANUAL') => {
    const newTx = {
      id: `tx-${Date.now()}`,
      productId,
      productName,
      type,
      quantity,
      unit,
      price,
      source,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addProduct = (prodData) => {
    const newProd = {
      id: `prod-${Date.now()}`,
      name: prodData.name,
      category: prodData.category || 'General',
      quantity: Number(prodData.quantity) || 0,
      unit: prodData.unit || 'Pieces',
      price: Number(prodData.price) || 0,
      reorderLevel: Number(prodData.reorderLevel) || 5,
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [newProd, ...prev]);
    if (newProd.quantity > 0) {
      logTransaction(newProd.id, newProd.name, 'IN', newProd.quantity, newProd.unit, newProd.price, 'MANUAL');
    }
  };

  const editProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields, updatedAt: new Date().toISOString() } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addStock = (productId, qty, unit, source = 'MANUAL') => {
    const product = products.find(p => p.id === productId || p.name.toLowerCase() === String(productId).toLowerCase());
    if (!product) return { success: false, message: 'Product not found' };

    const numQty = Number(qty);
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return { ...p, quantity: p.quantity + numQty, updatedAt: new Date().toISOString() };
      }
      return p;
    }));

    logTransaction(product.id, product.name, 'IN', numQty, unit || product.unit, product.price, source);
    return { success: true, newQty: product.quantity + numQty, productName: product.name };
  };

  const removeStock = (productId, qty, unit, source = 'MANUAL') => {
    const product = products.find(p => p.id === productId || p.name.toLowerCase() === String(productId).toLowerCase());
    if (!product) return { success: false, message: 'Product not found' };

    const numQty = Number(qty);
    if (product.quantity < numQty) {
      return { 
        success: false, 
        message: `Insufficient stock! Currently available: ${product.quantity} ${product.unit}`,
        currentStock: product.quantity
      };
    }

    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return { ...p, quantity: p.quantity - numQty, updatedAt: new Date().toISOString() };
      }
      return p;
    }));

    logTransaction(product.id, product.name, 'OUT', numQty, unit || product.unit, product.price, source);
    return { success: true, newQty: product.quantity - numQty, productName: product.name };
  };

  // Khata Actions
  const addCustomer = (custData) => {
    const newCust = {
      id: `cust-${Date.now()}`,
      name: custData.name,
      phone: custData.phone || '',
      currentBalance: Number(custData.initialBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const addCredit = (customerId, amount, notes = '', source = 'MANUAL') => {
    const cust = customers.find(c => c.id === customerId || c.name.toLowerCase() === String(customerId).toLowerCase());
    if (!cust) return { success: false, message: 'Customer not found' };

    const numAmount = Number(amount);
    const newBal = cust.currentBalance + numAmount;

    setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, currentBalance: newBal, updatedAt: new Date().toISOString() } : c));
    
    const newKTx = {
      id: `ktx-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.name,
      type: 'CREDIT_GIVEN',
      amount: numAmount,
      balanceAfter: newBal,
      notes,
      source,
      createdAt: new Date().toISOString()
    };
    setKhataTransactions(prev => [newKTx, ...prev]);

    return { success: true, customerName: cust.name, previousBalance: cust.currentBalance, newBalance: newBal, amount: numAmount };
  };

  const recordPayment = (customerId, amount, notes = '', source = 'MANUAL', forceOverpay = false) => {
    const cust = customers.find(c => c.id === customerId || c.name.toLowerCase() === String(customerId).toLowerCase());
    if (!cust) return { success: false, message: 'Customer not found' };

    const numAmount = Number(amount);
    if (numAmount > cust.currentBalance && !forceOverpay) {
      return {
        success: false,
        requiresConfirmation: true,
        message: `Payment (₹${numAmount}) exceeds outstanding balance (₹${cust.currentBalance}). Confirm payment?`,
        customer: cust,
        amount: numAmount
      };
    }

    const newBal = Math.max(0, cust.currentBalance - numAmount);
    setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, currentBalance: newBal, updatedAt: new Date().toISOString() } : c));
    
    const newKTx = {
      id: `ktx-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.name,
      type: 'PAYMENT_RECEIVED',
      amount: numAmount,
      balanceAfter: newBal,
      notes,
      source,
      createdAt: new Date().toISOString()
    };
    setKhataTransactions(prev => [newKTx, ...prev]);

    return { success: true, customerName: cust.name, previousBalance: cust.currentBalance, newBalance: newBal, amount: numAmount };
  };

  const deleteCustomer = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setKhataTransactions(prev => prev.filter(t => t.customerId !== customerId));
    return { success: true, customerName: cust ? cust.name : '' };
  };

  // -----------------------------------------------------------------
  // MODULE 5: SUPPORT & ONBOARDING ACTIONS
  // -----------------------------------------------------------------

  const updateUserProfile = (updatedFields) => {
    setUserProfile(prev => ({ ...prev, ...updatedFields }));
  };

  const submitCallbackRequest = (reqData) => {
    const count = callbackRequests.length + 124;
    const newReq = {
      id: `req-${Date.now()}`,
      requestId: `SUP-${String(count).padStart(6, '0')}`,
      shopId: userProfile.shopId,
      name: userProfile.name,
      phone: reqData.phone || userProfile.phone,
      category: reqData.category || 'Other',
      description: reqData.description || '',
      preferredLanguage: settings.appLanguage || 'en',
      status: 'Pending',
      assignedAgentId: null,
      internalNotes: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    setCallbackRequests(prev => [newReq, ...prev]);

    // If phone number was edited during callback form, save it back to userProfile
    if (reqData.phone && reqData.phone !== userProfile.phone) {
      updateUserProfile({ phone: reqData.phone });
    }

    return newReq;
  };

  const submitSupportTicket = (tktData) => {
    const count = supportTickets.length + 452;
    const newTkt = {
      id: `tkt-${Date.now()}`,
      ticketId: `TKT-${String(count).padStart(6, '0')}`,
      shopId: userProfile.shopId,
      name: userProfile.name,
      email: tktData.email || userProfile.email,
      phone: tktData.phone || userProfile.phone,
      category: tktData.category || 'Other',
      subject: tktData.subject || `${tktData.category} - Support Request`,
      description: tktData.description || '',
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    setSupportTickets(prev => [newTkt, ...prev]);
    return newTkt;
  };

  const updateCallbackStatus = (requestId, newStatus, agentId = null, notes = null) => {
    setCallbackRequests(prev => prev.map(req => {
      if (req.id === requestId || req.requestId === requestId) {
        return {
          ...req,
          status: newStatus,
          assignedAgentId: agentId || req.assignedAgentId,
          internalNotes: notes || req.internalNotes,
          resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : req.resolvedAt
        };
      }
      return req;
    }));
  };

  const completeOnboarding = () => {
    updateUserProfile({ onboardingCompleted: true });
  };

  const addCustomUnit = (unitName) => {
    if (!settings.customUnits.includes(unitName)) {
      setSettings(prev => ({
        ...prev,
        customUnits: [...prev.customUnits, unitName]
      }));
    }
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setKhataTransactions(INITIAL_KHATA_TRANSACTIONS);
    setUserProfile({ ...INITIAL_USER_PROFILE, onboardingCompleted: true });
    setCallbackRequests(INITIAL_CALLBACK_REQUESTS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    localStorage.removeItem('voice_inv_products');
    localStorage.removeItem('voice_inv_transactions');
    localStorage.removeItem('voice_khata_customers');
    localStorage.removeItem('voice_khata_transactions');
    localStorage.removeItem('voice_user_profile');
    localStorage.removeItem('voice_callback_requests');
    localStorage.removeItem('voice_support_tickets');
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity === 0) return { label: 'Out of Stock', code: 'OUT_OF_STOCK', color: 'var(--status-out-stock)' };
    if (quantity <= reorderLevel) return { label: 'Low Stock', code: 'LOW_STOCK', color: 'var(--status-low-stock)' };
    return { label: 'In Stock', code: 'IN_STOCK', color: 'var(--status-in-stock)' };
  };

  return (
    <InventoryContext.Provider value={{
      products,
      transactions,
      customers,
      khataTransactions,
      userProfile,
      callbackRequests,
      supportTickets,
      settings,
      setSettings,
      addProduct,
      editProduct,
      deleteProduct,
      addStock,
      removeStock,
      addCustomer,
      addCredit,
      recordPayment,
      deleteCustomer,
      updateUserProfile,
      submitCallbackRequest,
      submitSupportTicket,
      updateCallbackStatus,
      completeOnboarding,
      addCustomUnit,
      resetToDemoData,
      getStockStatus
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);

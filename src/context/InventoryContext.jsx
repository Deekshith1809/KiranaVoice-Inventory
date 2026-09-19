import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { useAuth } from './AuthContext';

import { apiService } from '../services/apiService';

import {
  INITIAL_CUSTOMERS,
  INITIAL_KHATA_TRANSACTIONS
} from '../services/khataService';

import {
  INITIAL_USER_PROFILE,
  INITIAL_CALLBACK_REQUESTS,
  INITIAL_SUPPORT_TICKETS
} from '../services/supportService';

const InventoryContext = createContext();

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    shop_id: 'shop-001',
    name: 'Rice',
    category: 'Grains & Pulses',
    quantity: 45,
    unit: 'Bags',
    price: 1400,
    reorderLevel: 10,
    stockValue: 63000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    shop_id: 'shop-001',
    name: 'Sugar',
    category: 'Groceries',
    quantity: 70,
    unit: 'Kg',
    price: 45,
    reorderLevel: 20,
    stockValue: 3150,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    shop_id: 'shop-001',
    name: 'Biscuits',
    category: 'Snacks & Bakery',
    quantity: 8,
    unit: 'Cartons',
    price: 650,
    reorderLevel: 10,
    stockValue: 5200,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    shop_id: 'shop-001',
    name: 'Milk',
    category: 'Dairy',
    quantity: 0,
    unit: 'Litres',
    price: 55,
    reorderLevel: 5,
    stockValue: 0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    shop_id: 'shop-001',
    name: 'Oil',
    category: 'Edible Oils',
    quantity: 12,
    unit: 'Boxes',
    price: 1800,
    reorderLevel: 5,
    stockValue: 21600,
    updatedAt: new Date().toISOString()
  }
];

export const InventoryProvider = ({ children }) => {

  const { user } = useAuth();

  /*
   * IMPORTANT:
   * Never hardcode shop-001 for authenticated inventory.
   * The backend gets the real shop from the JWT.
   */
  const shopId = user?.shopId || null;

  // =========================================================
  // INVENTORY STATE
  // =========================================================

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(
      'voice_inv_products'
    );

    return saved
      ? JSON.parse(saved)
      : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(
      'voice_inv_transactions'
    );

    return saved
      ? JSON.parse(saved)
      : [];
  });

  // =========================================================
  // SETTINGS
  // =========================================================

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(
      'voice_inv_settings'
    );

    return saved
      ? JSON.parse(saved)
      : {
          theme: 'dark',
          appLanguage: 'en',
          speechLanguage: 'en-IN',
          soundEnabled: true,
          customUnits: [
            'Bags',
            'Kg',
            'Grams',
            'Litres',
            'Cartons',
            'Boxes',
            'Dozens',
            'Quintals',
            'Pieces'
          ]
        };
  });

  // =========================================================
  // KHATA
  // =========================================================

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(
      'voice_khata_customers'
    );

    return saved
      ? JSON.parse(saved)
      : INITIAL_CUSTOMERS;
  });

  const [khataTransactions, setKhataTransactions] =
    useState(() => {
      const saved = localStorage.getItem(
        'voice_khata_transactions'
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_KHATA_TRANSACTIONS;
    });

  // =========================================================
  // SUPPORT / PROFILE
  // =========================================================

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem(
      'voice_user_profile'
    );

    return saved
      ? JSON.parse(saved)
      : INITIAL_USER_PROFILE;
  });

  const [callbackRequests, setCallbackRequests] =
    useState(() => {
      const saved = localStorage.getItem(
        'voice_callback_requests'
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_CALLBACK_REQUESTS;
    });

  const [supportTickets, setSupportTickets] =
    useState(() => {
      const saved = localStorage.getItem(
        'voice_support_tickets'
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_SUPPORT_TICKETS;
    });

  // =========================================================
  // LOAD BACKEND DATA
  // =========================================================

  useEffect(() => {
    async function loadBackendData() {

      if (!shopId) {
        return;
      }

      try {

        const fetchedProducts =
          await apiService.getProducts(shopId);

        if (
          fetchedProducts &&
          Array.isArray(fetchedProducts)
        ) {
          setProducts(fetchedProducts);
        }

        const fetchedTxs =
          await apiService.getTransactions(shopId);

        if (
          fetchedTxs &&
          Array.isArray(fetchedTxs)
        ) {
          setTransactions(fetchedTxs);
        }

        const langObj =
          await apiService.getLanguage(shopId);

        if (
          langObj &&
          langObj.language
        ) {
          setSettings(prev => ({
            ...prev,
            appLanguage: langObj.language
          }));
        }

      } catch (err) {

        console.info(
          'Could not load backend inventory:',
          err.message
        );
      }
    }

    loadBackendData();

  }, [shopId]);

  // =========================================================
  // LOCAL CACHE
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      'voice_inv_products',
      JSON.stringify(products)
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      'voice_inv_transactions',
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      'voice_inv_settings',
      JSON.stringify(settings)
    );
  }, [settings]);

  // =========================================================
  // REFRESH INVENTORY
  // =========================================================

  const refreshInventory = async () => {

    if (!shopId) {
      return;
    }

    try {

      const data =
        await apiService.getProducts(shopId);

      if (
        data &&
        Array.isArray(data)
      ) {
        setProducts(data);
      }

      const txs =
        await apiService.getTransactions(shopId);

      if (
        txs &&
        Array.isArray(txs)
      ) {
        setTransactions(txs);
      }

    } catch (e) {

      console.warn(
        'Could not refresh from API:',
        e.message
      );

      throw e;
    }
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const addProduct = async (prodData) => {

    if (!shopId) {
      throw new Error(
        'No authenticated shop found.'
      );
    }

    const newProd =
      await apiService.createProduct({
        name: prodData.name,
        category:
          prodData.category || 'General',
        quantity:
          Number(prodData.quantity) || 0,
        unit:
          prodData.unit || 'Pieces',
        price:
          Number(prodData.price) || 0,
        reorderLevel:
          Number(prodData.reorderLevel) || 5,
        shop_id: shopId
      });

    await refreshInventory();

    return newProd;
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const editProduct = async (
    id,
    updatedFields
  ) => {

    if (!shopId) {
      throw new Error(
        'No authenticated shop found.'
      );
    }

    await apiService.updateProduct(
      id,
      {
        ...updatedFields,
        shop_id: shopId
      }
    );

    await refreshInventory();
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async (id) => {

    if (!shopId) {
      throw new Error(
        'No authenticated shop found.'
      );
    }

    await apiService.deleteProduct(
      id,
      shopId
    );

    await refreshInventory();
  };

  // =========================================================
  // ADD STOCK
  // IMPORTANT:
  // No local fallback.
  // Backend/Supabase is the source of truth.
  // =========================================================

  const addStock = async (
    productId,
    qty,
    unit,
    source = 'MANUAL'
  ) => {

    const numQty = Number(qty);

    if (!shopId) {
      return {
        success: false,
        message:
          'No authenticated shop found. Please log in again.'
      };
    }

    if (
      !productId ||
      !Number.isFinite(numQty) ||
      numQty <= 0
    ) {
      return {
        success: false,
        message:
          'Invalid product or quantity.'
      };
    }

    try {

      const res =
        await apiService.addStock(
          productId,
          numQty,
          unit,
          source,
          shopId
        );

      await refreshInventory();

      return {
        success: true,
        newQty: res.newQuantity,
        productName: res.productName,
        unit: res.unit,
        message: res.message
      };

    } catch (err) {

      return {
        success: false,
        message:
          err.message ||
          'Could not add stock.'
      };
    }
  };

  // =========================================================
  // REMOVE STOCK
  // IMPORTANT:
  // No local fallback.
  // Backend/Supabase is the source of truth.
  // =========================================================

  const removeStock = async (
    productId,
    qty,
    unit,
    source = 'MANUAL'
  ) => {

    const numQty = Number(qty);

    if (!shopId) {
      return {
        success: false,
        message:
          'No authenticated shop found. Please log in again.'
      };
    }

    if (
      !productId ||
      !Number.isFinite(numQty) ||
      numQty <= 0
    ) {
      return {
        success: false,
        message:
          'Invalid product or quantity.'
      };
    }

    try {

      const res =
        await apiService.removeStock(
          productId,
          numQty,
          unit,
          source,
          shopId
        );

      await refreshInventory();

      return {
        success: true,
        newQty: res.newQuantity,
        productName: res.productName,
        unit: res.unit,
        message: res.message
      };

    } catch (err) {

      return {
        success: false,
        message:
          err.message ||
          'Could not remove stock.'
      };
    }
  };

  // =========================================================
  // LANGUAGE
  // =========================================================

  const setAppLanguage = async (
    newLang
  ) => {

    setSettings(prev => ({
      ...prev,
      appLanguage: newLang
    }));

    try {

      await apiService.updateLanguage(
        newLang,
        shopId
      );

    } catch (e) {

      console.info(
        'Saved language locally:',
        newLang
      );
    }
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (
    quantity,
    reorderLevel
  ) => {

    if (quantity === 0) {
      return {
        label: 'Out of Stock',
        code: 'OUT_OF_STOCK',
        color:
          'var(--status-out-stock)'
      };
    }

    if (
      quantity <= reorderLevel
    ) {
      return {
        label: 'Low Stock',
        code: 'LOW_STOCK',
        color:
          'var(--status-low-stock)'
      };
    }

    return {
      label: 'In Stock',
      code: 'IN_STOCK',
      color:
        'var(--status-in-stock)'
    };
  };

  // =========================================================
  // KHATA ACTIONS
  // =========================================================

  const addCustomer = (custData) => {

    const newCust = {
      id: `cust-${Date.now()}`,
      name: custData.name,
      phone: custData.phone || '',
      currentBalance:
        Number(custData.initialBalance) || 0,
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString()
    };

    setCustomers(prev => [
      newCust,
      ...prev
    ]);

    return newCust;
  };

  const addCredit = (
    customerId,
    amount,
    notes = '',
    source = 'MANUAL'
  ) => {

    const cust =
      customers.find(
        c =>
          c.id === customerId ||
          c.name.toLowerCase() ===
            String(customerId).toLowerCase()
      );

    if (!cust) {
      return {
        success: false,
        message: 'Customer not found'
      };
    }

    const numAmount =
      Number(amount);

    const newBal =
      cust.currentBalance +
      numAmount;

    setCustomers(prev =>
      prev.map(c =>
        c.id === cust.id
          ? {
              ...c,
              currentBalance:
                newBal,
              updatedAt:
                new Date().toISOString()
            }
          : c
      )
    );

    const newKTx = {
      id: `ktx-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.name,
      type: 'CREDIT_GIVEN',
      amount: numAmount,
      balanceAfter: newBal,
      notes,
      source,
      createdAt:
        new Date().toISOString()
    };

    setKhataTransactions(prev => [
      newKTx,
      ...prev
    ]);

    return {
      success: true,
      customerName: cust.name,
      previousBalance:
        cust.currentBalance,
      newBalance: newBal,
      amount: numAmount
    };
  };

  const recordPayment = (
    customerId,
    amount,
    notes = '',
    source = 'MANUAL',
    forceOverpay = false
  ) => {

    const cust =
      customers.find(
        c =>
          c.id === customerId ||
          c.name.toLowerCase() ===
            String(customerId).toLowerCase()
      );

    if (!cust) {
      return {
        success: false,
        message: 'Customer not found'
      };
    }

    const numAmount =
      Number(amount);

    if (
      numAmount >
        cust.currentBalance &&
      !forceOverpay
    ) {
      return {
        success: false,
        requiresConfirmation: true,
        message:
          `Payment (₹${numAmount}) exceeds outstanding balance (₹${cust.currentBalance}). Confirm payment?`,
        customer: cust,
        amount: numAmount
      };
    }

    const newBal =
      Math.max(
        0,
        cust.currentBalance -
          numAmount
      );

    setCustomers(prev =>
      prev.map(c =>
        c.id === cust.id
          ? {
              ...c,
              currentBalance:
                newBal,
              updatedAt:
                new Date().toISOString()
            }
          : c
      )
    );

    const newKTx = {
      id: `ktx-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.name,
      type: 'PAYMENT_RECEIVED',
      amount: numAmount,
      balanceAfter: newBal,
      notes,
      source,
      createdAt:
        new Date().toISOString()
    };

    setKhataTransactions(prev => [
      newKTx,
      ...prev
    ]);

    return {
      success: true,
      customerName: cust.name,
      previousBalance:
        cust.currentBalance,
      newBalance: newBal,
      amount: numAmount
    };
  };

  const deleteCustomer = (
    customerId
  ) => {

    const cust =
      customers.find(
        c => c.id === customerId
      );

    setCustomers(prev =>
      prev.filter(
        c => c.id !== customerId
      )
    );

    setKhataTransactions(prev =>
      prev.filter(
        t =>
          t.customerId !==
          customerId
      )
    );

    return {
      success: true,
      customerName:
        cust ? cust.name : ''
    };
  };

  // =========================================================
  // PROFILE / SUPPORT
  // =========================================================

  const updateUserProfile = (
    fields
  ) =>
    setUserProfile(prev => ({
      ...prev,
      ...fields
    }));

  const submitCallbackRequest = (
    reqData
  ) => {

    const count =
      callbackRequests.length +
      124;

    const newReq = {
      id: `req-${Date.now()}`,
      requestId:
        `SUP-${String(count).padStart(6, '0')}`,
      shopId,
      name:
        userProfile.name,
      phone:
        reqData.phone ||
        userProfile.phone,
      category:
        reqData.category ||
        'Other',
      description:
        reqData.description ||
        '',
      preferredLanguage:
        settings.appLanguage ||
        'en',
      status: 'Pending',
      createdAt:
        new Date().toISOString()
    };

    setCallbackRequests(prev => [
      newReq,
      ...prev
    ]);

    return newReq;
  };

  const submitSupportTicket = (
    tktData
  ) => {

    const count =
      supportTickets.length +
      452;

    const newTkt = {
      id: `tkt-${Date.now()}`,
      ticketId:
        `TKT-${String(count).padStart(6, '0')}`,
      shopId,
      name:
        userProfile.name,
      email:
        tktData.email ||
        userProfile.email,
      phone:
        tktData.phone ||
        userProfile.phone,
      category:
        tktData.category ||
        'Other',
      subject:
        tktData.subject ||
        `${tktData.category} - Support Request`,
      description:
        tktData.description ||
        '',
      status: 'Open',
      createdAt:
        new Date().toISOString()
    };

    setSupportTickets(prev => [
      newTkt,
      ...prev
    ]);

    return newTkt;
  };

  const updateCallbackStatus = (
    reqId,
    newStatus
  ) => {

    setCallbackRequests(prev =>
      prev.map(r =>
        r.id === reqId ||
        r.requestId === reqId
          ? {
              ...r,
              status: newStatus
            }
          : r
      )
    );
  };

  const completeOnboarding = () =>
    updateUserProfile({
      onboardingCompleted: true
    });

  const resetToDemoData = () => {

    setProducts(
      INITIAL_PRODUCTS
    );

    setTransactions([]);

    setCustomers(
      INITIAL_CUSTOMERS
    );

    setKhataTransactions(
      INITIAL_KHATA_TRANSACTIONS
    );

    localStorage.clear();
  };

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <InventoryContext.Provider
      value={{
        products,
        transactions,
        customers,
        khataTransactions,
        userProfile,
        callbackRequests,
        supportTickets,
        settings,

        setSettings,
        setAppLanguage,

        addProduct,
        editProduct,
        deleteProduct,

        addStock,
        removeStock,
        refreshInventory,

        addCustomer,
        addCredit,
        recordPayment,
        deleteCustomer,

        updateUserProfile,

        submitCallbackRequest,
        submitSupportTicket,
        updateCallbackStatus,

        completeOnboarding,
        resetToDemoData,

        getStockStatus
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () =>
  useContext(InventoryContext);
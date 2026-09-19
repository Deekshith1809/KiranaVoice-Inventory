const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function request(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers
    });

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        message: text
      };
    }

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        `API Request Failed (${response.status})`
      );
    }

    return data;
  } catch (err) {
    console.warn(
      `[apiService] Error on ${endpoint}:`,
      err.message
    );

    throw err;
  }
}

export const apiService = {

  // =========================================================
  // PRODUCTS
  // =========================================================

  getProducts: (shopId) =>
    request(
      `/products${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  getProduct: (id, shopId) =>
    request(
      `/products/${id}${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),

  deleteProduct: (id, shopId) =>
    request(
      `/products/${id}${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`,
      {
        method: 'DELETE'
      }
    ),

  // =========================================================
  // INVENTORY / STOCK
  // =========================================================

  addStock: (
    productId,
    quantity,
    unit = null,
    source = 'MANUAL',
    shopId = null
  ) =>
    request('/inventory/add', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        unit,
        source,
        shop_id: shopId
      })
    }),

  removeStock: (
    productId,
    quantity,
    unit = null,
    source = 'MANUAL',
    shopId = null
  ) =>
    request('/inventory/remove', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        unit,
        source,
        shop_id: shopId
      })
    }),

  getTransactions: (shopId) =>
    request(
      `/inventory/transactions${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  getLowStock: (shopId) =>
    request(
      `/inventory/low-stock${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  getOutOfStock: (shopId) =>
    request(
      `/inventory/out-of-stock${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  getReorderSuggestions: (shopId) =>
    request(
      `/inventory/reorder${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  // =========================================================
  // VOICE
  // =========================================================

  processVoiceCommand: (
    transcript,
    language = 'en',
    shopId = null
  ) =>
    request('/voice/process', {
      method: 'POST',
      body: JSON.stringify({
        transcript,
        language,
        shop_id: shopId
      })
    }),

  queryVoiceInventory: (
    query,
    language = 'en',
    shopId = null
  ) =>
    request('/voice/query', {
      method: 'POST',
      body: JSON.stringify({
        query,
        language,
        shop_id: shopId
      })
    }),

  // =========================================================
  // SETTINGS
  // =========================================================

  getLanguage: (shopId) =>
    request(
      `/settings/language${
        shopId
          ? `?shop_id=${encodeURIComponent(shopId)}`
          : ''
      }`
    ),

  updateLanguage: (
    language,
    shopId = null
  ) =>
    request('/settings/language', {
      method: 'PUT',
      body: JSON.stringify({
        language,
        shop_id: shopId
      })
    })
};
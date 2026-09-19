import { buildApiUrl, safeApiFetch } from './apiConfig';

async function request(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  try {
    return await safeApiFetch(url, options);
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
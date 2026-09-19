// Centralized API Configuration for KiranaVoice Inventory
// Automatically handles VITE_API_URL in production (Render) and localhost fallback in development.

const getRawBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }
  return 'http://localhost:8000';
};

const rawBaseUrl = getRawBaseUrl().replace(/\/+$/, '');

// Ensure API_BASE_URL always ends with '/api' without duplication
export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

export const SERVER_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;

/**
 * Builds a clean, fully-qualified API URL given an endpoint path.
 * Eliminates double slashes, duplicate /api prefixes, and trailing slash glitches.
 * 
 * Examples:
 * buildApiUrl('/auth/login') => 'https://kiranavoice-inventory.onrender.com/api/auth/login'
 * buildApiUrl('products') => 'https://kiranavoice-inventory.onrender.com/api/products'
 * buildApiUrl('/api/voice/process') => 'https://kiranavoice-inventory.onrender.com/api/voice/process'
 */
export function buildApiUrl(endpoint = '') {
  if (!endpoint) return API_BASE_URL;

  // If endpoint is already a full http:// or https:// URL, return as-is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If caller provided leading '/api', strip it to prevent '/api/api/...'
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  } else if (cleanEndpoint === '/api') {
    cleanEndpoint = '';
  }

  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Retrieves the stored JWT authentication token header.
 */
export function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Enhanced fetch wrapper with robust error handling for HTTP statuses and network failures.
 */
export async function safeApiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    console.error('[API Network Error]:', netErr);
    throw new Error(
      'Unable to connect to KiranaVoice server. Please check your internet connection or backend deployment status.'
    );
  }

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    let errorMessage = data.detail || data.message;
    if (!errorMessage) {
      switch (response.status) {
        case 400:
          errorMessage = 'Bad request. Please check input data.';
          break;
        case 401:
          errorMessage = 'Session expired or unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 409:
          errorMessage = 'Conflict. Record already exists.';
          break;
        case 422:
          errorMessage = 'Validation error. Please verify input fields.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `API request failed with status ${response.status}.`;
      }
    }

    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

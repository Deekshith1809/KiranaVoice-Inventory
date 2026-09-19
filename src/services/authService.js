const API_BASE_URL =  'https://kiranavoice-inventory.onrender.com';

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function authRequest(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Authentication failed');
    }

    return data;
  } catch (err) {
    console.warn(`[authService] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const authService = {
  login: async (credentials) => {
    const res = await authRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token) {
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  register: async (userData) => {
    const res = await authRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) {
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getMe: async () => {
    const res = await authRequest('/me');
    if (res && res.id) {
      localStorage.setItem('auth_user', JSON.stringify(res));
    }
    return res;
  },

  forgotPassword: (email) => authRequest('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  resetPassword: (token, newPassword, confirmPassword) => authRequest('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword, confirmPassword })
  }),

  updateProfile: async (profileData) => {
    const res = await authRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (res.user) {
      localStorage.setItem('auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  changePassword: (currentPassword, newPassword, confirmPassword) => authRequest('/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
  }),

  getToken: () => localStorage.getItem('auth_token'),
  getStoredUser: () => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  }
};

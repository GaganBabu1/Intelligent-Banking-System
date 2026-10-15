import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  validate: () => api.get('/auth/validate'),
};

// User API calls
export const userAPI = {
  getProfile: (userId) => api.get(`/user/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/user/profile/${userId}`, data),
};

// Account API calls
export const accountAPI = {
  createAccount: (data) => api.post('/accounts', data),
  getAccount: (id) => api.get(`/accounts/${id}`),
  getUserAccounts: (userId) => api.get(`/accounts/user/${userId}`),
  getAllAccounts: (page = 0, size = 20) => api.get(`/admin/accounts?page=${page}&size=${size}`),
  deposit: (data) => api.post('/accounts/deposit', data),
  withdraw: (data) => api.post('/accounts/withdraw', data),
  transfer: (data) => api.post('/accounts/transfer', data),
  freezeAccount: (accountNumber, reason) => 
    api.post(`/admin/accounts/${accountNumber}/freeze`, { reason }),
  unfreezeAccount: (accountNumber) => 
    api.post(`/admin/accounts/${accountNumber}/unfreeze`),
  closeAccount: (accountNumber) => 
    api.post(`/admin/accounts/${accountNumber}/close`),
};

// Transaction API calls
export const transactionAPI = {
  getTransactions: (accountId, page = 0, size = 10) => 
    api.get(`/accounts/${accountId}/transactions?page=${page}&size=${size}`),
  getOutgoingTransactions: (accountId, page = 0, size = 10) =>
    api.get(`/accounts/${accountId}/transactions/outgoing?page=${page}&size=${size}`),
  getIncomingTransactions: (accountId, page = 0, size = 10) =>
    api.get(`/accounts/${accountId}/transactions/incoming?page=${page}&size=${size}`),
  getTransactionDetails: (transactionRef) =>
    api.get(`/accounts/transaction/${transactionRef}`),
};

// Admin API calls
const MOCK_ANOMALY_QUEUE = Object.freeze([
  {
    priority: 'HIGH',
    accountReference: '****4821',
    riskScore: 87,
    reason: 'Transfer pattern is significantly different from normal activity',
    factors: [
      'Transfer amount is 4x the recent average',
      'Multiple transfers occurred within a short period',
      '82% of the daily transfer limit was used',
    ],
  },
  {
    priority: 'MEDIUM',
    accountReference: '****1190',
    riskScore: 64,
    reason: 'Account is approaching an unusual activity threshold',
    factors: [
      'Outgoing activity increased recently',
      'Transfer-limit usage is elevated',
    ],
  },
]);

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getStatistics: () => api.get('/admin/statistics'),
  resetDailyLimits: () => api.post('/admin/reset-daily-limits'),
  getAnomalyQueue: () => api.get('/admin/insights/anomaly-queue'),
  getMockAnomalyQueue: () => Promise.resolve({ data: MOCK_ANOMALY_QUEUE }),
};

export default api;

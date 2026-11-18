import axios from 'axios';

// Default Node.js Backend endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cornai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('cornai_token', response.data.token);
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  uploadProfileImage: async (formData) => {
    const response = await api.post('/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, resetCode, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, resetCode, newPassword });
    return response.data;
  },
};

export const scanService = {
  uploadAndAnalyze: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/scan/history');
    return response.data;
  },

  deleteScan: async (id) => {
    const response = await api.delete(`/scan/${id}`);
    return response.data;
  },

  deleteHistory: async (range = 'all') => {
    const response = await api.delete('/scan/history', {
      params: { range },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/scan/stats');
    return response.data;
  },

  downloadReport: async (period = 'weekly') => {
    const response = await api.get('/scan/report/download', {
      params: { period },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CornAI_${period}_report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  emailReport: async (period = 'weekly', recipientEmail = null) => {
    const response = await api.post('/scan/report/email', {
      period,
      recipientEmail,
    });
    return response.data;
  },
};

export default api;

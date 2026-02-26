/**
 * API Service - Centralized API Client
 * SGDUS Mobile App
 * 
 * Handles all HTTP requests to backend services
 * OID Root: 1.3.6.1.4.1.61026
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URLs
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' 
  : 'https://api.sd.brainsait.com/api';

// Identity Service URL (separate from main API)
const IDENTITY_SERVICE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'https://identity.sd.brainsait.com';

// AI Service URL
const AI_SERVICE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'https://ai.sd.brainsait.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@sgdus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add OID to headers for identification
    const oid = await AsyncStorage.getItem('@sgdus_oid');
    if (oid) {
      config.headers['X-Citizen-OID'] = oid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem('@sgdus_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          if (response.data.success) {
            const { token } = response.data;
            await AsyncStorage.setItem('@sgdus_token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
        
        // If refresh fails, clear auth
        await AsyncStorage.multiRemove([
          '@sgdus_user',
          '@sgdus_oid',
          '@sgdus_token',
          '@sgdus_refresh_token',
        ]);
        
        // Navigate to login
        // Note: Navigation would be handled in components
      } catch (refreshError) {
        await AsyncStorage.multiRemove([
          '@sgdus_user',
          '@sgdus_oid',
          '@sgdus_token',
          '@sgdus_refresh_token',
        ]);
      }
    }
    
    return Promise.reject(error);
  }
);

// Lightweight clients for services routed via Kong (no refresh-token logic).
const createServiceClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  client.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('@sgdus_token');
    const oid = await AsyncStorage.getItem('@sgdus_oid');
    config.headers = config.headers || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (oid) config.headers['X-Citizen-OID'] = oid;
    return config;
  });

  return client;
};

const identityApi = createServiceClient(IDENTITY_SERVICE_URL);
const aiApi = createServiceClient(AI_SERVICE_URL);

// Identity Service (direct connection to identity service)
export const identityService = {
  register: (data) => identityApi.post('/api/identity/register', data),
  login: (nationalId, password) => identityApi.post('/api/identity/login', { nationalId, password }),
  verify: (oid, otp) => identityApi.post('/api/identity/verify', { oid, otp }),
  getProfile: () => identityApi.get('/api/identity/profile'),
  updateProfile: (data) => identityApi.put('/api/identity/profile', data),
  changePassword: (currentPassword, newPassword) => identityApi.post('/api/identity/change-password', { currentPassword, newPassword }),
  requestOtp: () => identityApi.post('/api/identity/request-otp'),
  getBusinesses: () => identityApi.get('/api/identity/businesses'),
  registerBusiness: (data) => identityApi.post('/api/identity/business/register', data),
  search: (query, type) => identityApi.get('/api/identity/search', { params: { q: query, type } }),
  getStats: () => identityApi.get('/api/identity/stats'),
};

// AI Service (direct connection to AI service)
export const aiService = {
  nlpProcess: (text, language) => aiApi.post('/api/ai/nlp/process', { text, language }),
  detectLanguage: (text) => aiApi.post('/api/ai/nlp/detect-language', { text }),
  translate: (text, source, target) => aiApi.post('/api/ai/translate', { text, source, target }),
  sentiment: (text) => aiApi.post('/api/ai/sentiment', { text }),
  intent: (text) => aiApi.post('/api/ai/intent', { text }),
  recommend: (profile) => aiApi.post('/api/ai/recommend', { profile }),
  predict: (citizenOid, data) => aiApi.post('/api/ai/predict', { citizenOid, data }),
  chat: (message, context) => aiApi.post('/api/ai/chat', { message, context }),
  ocr: (image) => aiApi.post('/api/ai/ocr', { image }),
  voice: (audio) => aiApi.post('/api/ai/voice', { audio }),
};

// OID Service
export const oidService = {
  resolve: (oid) => api.get(`/oid/resolve/${oid}`),
  verify: (oid) => api.get(`/oid/verify/${oid}`),
  getHistory: (oid) => api.get(`/oid/history/${oid}`),
  generateQR: (oid) => api.get(`/oid/qr/${oid}`),
};

// Agency Integration Service
export const agencyService = {
  getServices: (agencyCode) => api.get(`/agencies/${agencyCode}/services`),
  shareData: (agencyCode, data) => api.post(`/agencies/${agencyCode}/share`, data),
  requestData: (agencyCode, data) => api.post(`/agencies/${agencyCode}/request`, data),
  verifyAccess: (citizenOid, agencies) => api.post('/agencies/verify', { citizenOid, agencies }),
  getConsent: (citizenOid) => api.get(`/consent/${citizenOid}`),
  grantConsent: (data) => api.post('/consent/grant', data),
  revokeConsent: (data) => api.post('/consent/revoke', data),
};

// Health Service
export const healthService = {
  getRecords: () => api.get('/health/records'),
  getAppointments: () => api.get('/health/appointments'),
  bookAppointment: (data) => api.post('/health/appointments', data),
  getVaccinations: () => api.get('/health/vaccinations'),
  getPrescriptions: () => api.get('/health/prescriptions'),
  findHospital: (location) => api.get('/health/hospitals', { params: location }),
};

// Education Service
export const educationService = {
  getRecords: () => api.get('/education/records'),
  getCertificates: () => api.get('/education/certificates'),
  verifyCertificate: (certificateId) => api.get(`/education/certificates/verify/${certificateId}`),
  getSchools: (location) => api.get('/education/schools', { params: location }),
  getExamResults: () => api.get('/education/exam-results'),
};

// Agriculture Service
export const agricultureService = {
  getProfile: () => api.get('/agriculture/profile'),
  registerFarm: (data) => api.post('/agriculture/farms', data),
  getFarms: () => api.get('/agriculture/farms'),
  getCropPrices: () => api.get('/agriculture/prices'),
  getWeather: () => api.get('/agriculture/weather'),
  getSubsidies: () => api.get('/agriculture/subsidies'),
};

// Infrastructure Service
export const infrastructureService = {
  getAll: () => api.get('/infrastructure'),
  getWater: () => api.get('/infrastructure/water'),
  getDams: () => api.get('/infrastructure/water/dams'),
  getIrrigation: () => api.get('/infrastructure/water/irrigation'),
  getRivers: () => api.get('/infrastructure/water/rivers'),
  getPorts: () => api.get('/infrastructure/ports'),
  getPortDetails: (portName) => api.get(`/infrastructure/ports/${portName}`),
  getRoadNetwork: () => api.get('/infrastructure/roads'),
  getBridges: () => api.get('/infrastructure/bridges'),
};

// Mining Service
export const miningService = {
  getGoldData: () => api.get('/mining/gold'),
  getMinerals: () => api.get('/mining/minerals'),
  getMiningZones: () => api.get('/mining/zones'),
  getExportData: () => api.get('/mining/export'),
  getArtisanalData: () => api.get('/mining/artisanal'),
  getLicenses: () => api.get('/mining/licenses'),
  applyLicense: (data) => api.post('/mining/licenses', data),
  verifyLicense: (licenseNumber) => api.get(`/mining/licenses/verify/${licenseNumber}`),
};

// Finance Service
export const financeService = {
  getTaxRecords: () => api.get('/finance/tax-records'),
  getSocialBenefits: () => api.get('/finance/social-benefits'),
  verifyTaxStatus: (taxId) => api.get(`/finance/tax-status/${taxId}`),
};

// Notification Service
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
};

// USSD Service
export const ussdService = {
  checkStatus: (appNumber) => api.get(`/ussd/status/${appNumber}`),
  startSession: (phoneNumber) => api.post('/ussd/session', { phoneNumber }),
};

export default api;

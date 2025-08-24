// Sudan Digital Identity API Connector
// Production API integration layer for government services

import axios from 'axios';
import { blockchainService, AuditTrailManager } from './blockchainService';

class APIConnector {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://api.sudan.gov.sd/v1';
    this.authToken = localStorage.getItem('authToken');
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': '1.0',
        'X-Client-ID': 'sudan-identity-portal'
      }
    });

    // Add request interceptor for auth and logging
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Add citizen OID for audit tracking
        const currentOid = localStorage.getItem('currentCitizenOid');
        if (currentOid) {
          config.headers['X-Citizen-OID'] = currentOid;
        }

        // Add request timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();
        
        console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling and audit logging
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        
        // Log successful API calls to blockchain
        this.logAPIAccess(response.config, response.status, 'success');
        
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.message);
        
        // Log failed API calls to blockchain
        this.logAPIAccess(error.config, error.response?.status || 0, 'error');
        
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Log API access to blockchain for audit trails
  async logAPIAccess(config, status, result) {
    try {
      const currentOid = localStorage.getItem('currentCitizenOid');
      if (currentOid && config) {
        await AuditTrailManager.recordServiceUsage(
          currentOid,
          `api.${config.url?.split('/').pop() || 'unknown'}`,
          config.method?.toUpperCase() || 'GET'
        );
      }
    } catch (error) {
      console.warn('Failed to log API access to blockchain:', error);
    }
  }

  // Enhanced error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          this.handleUnauthorized();
          return new Error('Authentication required. Please log in again.');
        case 403:
          return new Error('Access denied. You don\'t have permission for this resource.');
        case 404:
          return new Error('Resource not found.');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Internal server error. Please try again later.');
        default:
          return new Error(data.message || `Server error: ${status}`);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your internet connection.');
    } else {
      return new Error('Request failed. Please try again.');
    }
  }

  // Handle unauthorized access
  handleUnauthorized() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentCitizenOid');
    window.location.href = '/login';
  }

  // Set authentication token
  setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication
  clearAuth() {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  // ===========================================
  // CITIZEN IDENTITY API METHODS
  // ===========================================

  // Get citizen by OID
  async getCitizenByOid(oid) {
    try {
      const response = await this.api.get(`/citizens/oid/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create new citizen identity
  async createCitizenIdentity(citizenData) {
    try {
      const response = await this.api.post('/citizens', citizenData);
      
      // Log identity creation to blockchain
      if (response.data.oid) {
        await AuditTrailManager.recordOIDCreation(response.data);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update citizen information
  async updateCitizenInfo(oid, updateData) {
    try {
      const response = await this.api.put(`/citizens/oid/${oid}`, updateData);
      
      // Log data modification to blockchain
      for (const [fieldName, newValue] of Object.entries(updateData)) {
        await AuditTrailManager.recordDataChange(
          oid, 
          fieldName, 
          'previous_value', // Would come from form comparison
          newValue,
          updateData.reason || 'Citizen requested update'
        );
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validate citizen identity
  async validateIdentity(oid, validationData) {
    try {
      const response = await this.api.post(`/citizens/oid/${oid}/validate`, validationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // MINISTRY INTEGRATION METHODS
  // ===========================================

  // Health Ministry APIs
  async getHealthRecords(oid) {
    try {
      const response = await this.api.get(`/ministries/health/records/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateHealthRecord(oid, recordData) {
    try {
      const response = await this.api.put(`/ministries/health/records/${oid}`, recordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Education Ministry APIs
  async getEducationRecords(oid) {
    try {
      const response = await this.api.get(`/ministries/education/records/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addEducationCertificate(oid, certificateData) {
    try {
      const response = await this.api.post(`/ministries/education/certificates/${oid}`, certificateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Interior Ministry APIs
  async getCriminalRecord(oid) {
    try {
      const response = await this.api.get(`/ministries/interior/criminal-record/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async requestPassport(oid, passportData) {
    try {
      const response = await this.api.post(`/ministries/interior/passport/${oid}`, passportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Finance Ministry APIs
  async getTaxRecords(oid) {
    try {
      const response = await this.api.get(`/ministries/finance/tax-records/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async submitTaxReturn(oid, taxData) {
    try {
      const response = await this.api.post(`/ministries/finance/tax-returns/${oid}`, taxData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Energy Ministry APIs
  async getEnergyConsumption(oid) {
    try {
      const response = await this.api.get(`/ministries/energy/consumption/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async requestEnergyConnection(oid, connectionData) {
    try {
      const response = await this.api.post(`/ministries/energy/connections/${oid}`, connectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Infrastructure Ministry APIs
  async getInfrastructureServices(oid) {
    try {
      const response = await this.api.get(`/ministries/infrastructure/services/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Justice Ministry APIs
  async getLegalCases(oid) {
    try {
      const response = await this.api.get(`/ministries/justice/cases/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async submitLegalApplication(oid, applicationData) {
    try {
      const response = await this.api.post(`/ministries/justice/applications/${oid}`, applicationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // BIOMETRIC SERVICES
  // ===========================================

  async uploadBiometricData(oid, biometricData) {
    try {
      const formData = new FormData();
      
      if (biometricData.fingerprint) {
        formData.append('fingerprint', biometricData.fingerprint);
      }
      if (biometricData.faceImage) {
        formData.append('faceImage', biometricData.faceImage);
      }
      if (biometricData.irisImage) {
        formData.append('irisImage', biometricData.irisImage);
      }
      if (biometricData.voiceSample) {
        formData.append('voiceSample', biometricData.voiceSample);
      }

      const response = await this.api.post(`/biometric/${oid}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyBiometric(oid, biometricData, biometricType) {
    try {
      const response = await this.api.post(`/biometric/${oid}/verify`, {
        biometricData,
        biometricType
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // DOCUMENT MANAGEMENT
  // ===========================================

  async uploadDocument(oid, documentData) {
    try {
      const formData = new FormData();
      formData.append('document', documentData.file);
      formData.append('documentType', documentData.type);
      formData.append('description', documentData.description);

      const response = await this.api.post(`/documents/${oid}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDocuments(oid) {
    try {
      const response = await this.api.get(`/documents/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async downloadDocument(oid, documentId) {
    try {
      const response = await this.api.get(`/documents/${oid}/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // NOTIFICATIONS AND MESSAGING
  // ===========================================

  async getNotifications(oid) {
    try {
      const response = await this.api.get(`/notifications/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationRead(oid, notificationId) {
    try {
      const response = await this.api.put(`/notifications/${oid}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(oid, messageData) {
    try {
      const response = await this.api.post(`/messages/${oid}`, messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // ANALYTICS AND REPORTING
  // ===========================================

  async getUsageAnalytics(oid, dateRange) {
    try {
      const response = await this.api.get(`/analytics/usage/${oid}`, {
        params: dateRange
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const response = await this.api.get('/system/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // EXTERNAL INTEGRATIONS
  // ===========================================

  // Sudan Central Bank integration
  async getBankingInfo(oid) {
    try {
      const response = await this.api.get(`/integrations/banking/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // National Statistics Office integration
  async getCensusData(oid) {
    try {
      const response = await this.api.get(`/integrations/census/${oid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Sudan Post integration for address verification
  async verifyAddress(addressData) {
    try {
      const response = await this.api.post('/integrations/postal/verify-address', addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  // Get API status and version info
  async getAPIInfo() {
    try {
      const response = await this.api.get('/info');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Test API connectivity
  async pingAPI() {
    try {
      const response = await this.api.get('/ping');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Batch operations for bulk data processing
  async batchOperation(operations) {
    try {
      const response = await this.api.post('/batch', { operations });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const apiConnector = new APIConnector();

// Mock API responses for development/testing
export class MockAPIService {
  constructor() {
    this.mockDelay = () => new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
  }

  async getCitizenByOid(oid) {
    await this.mockDelay();
    return {
      oid: oid,
      name: 'أحمد محمد عبدالله / Ahmed Mohammed Abdullah',
      nationalId: '199012345678',
      dateOfBirth: '1990-01-15',
      placeOfBirth: 'الخرطوم / Khartoum',
      gender: 'male',
      nationality: 'Sudanese',
      address: {
        state: 'Khartoum',
        city: 'Khartoum',
        district: 'Khartoum 2',
        street: 'Al-Tahrir Street'
      },
      contact: {
        phone: '+249912345678',
        email: 'ahmed.mohammed@example.com'
      },
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };
  }

  async getHealthRecords(oid) {
    await this.mockDelay();
    return {
      oid: oid,
      bloodType: 'O+',
      allergies: ['Penicillin'],
      chronicConditions: [],
      vaccinations: [
        { name: 'COVID-19', date: '2023-01-15', status: 'completed' },
        { name: 'Hepatitis B', date: '2022-06-20', status: 'completed' }
      ],
      lastCheckup: '2023-12-01',
      healthInsurance: {
        provider: 'Sudan National Health Insurance',
        number: 'SNHI123456789',
        status: 'active'
      }
    };
  }

  async getEducationRecords(oid) {
    await this.mockDelay();
    return {
      oid: oid,
      qualifications: [
        {
          level: 'Bachelor',
          field: 'Computer Science',
          institution: 'University of Khartoum',
          year: 2012,
          grade: 'First Class'
        }
      ],
      certifications: [
        {
          name: 'Professional IT Certificate',
          issuer: 'Sudan IT Authority',
          date: '2023-06-15',
          status: 'valid'
        }
      ]
    };
  }

  // Add more mock methods as needed...
}

// Use mock service in development
export const apiService = process.env.NODE_ENV === 'development' 
  ? new MockAPIService() 
  : apiConnector;

export default APIConnector;
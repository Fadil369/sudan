// Sudan Digital Identity API Connector
// Production API integration layer for government services

import axios from 'axios';
import { blockchainService, AuditTrailManager } from './blockchainService';
import databaseService from './databaseService';
import ministryIntegrationService from './ministryIntegrationService';
import monitoringService from './monitoringService';
import auditLogger from '../security/AuditLogger';

class APIConnector {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://api.sd.brainsait.com/v1';
    this.authToken = localStorage.getItem('authToken');
    this.isProduction = process.env.NODE_ENV === 'production';
    this.mockData = process.env.REACT_APP_MOCK_DATA === 'true';
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': process.env.REACT_APP_API_VERSION || '1.0',
        'X-Client-ID': 'sudan-identity-portal',
        'X-Environment': process.env.NODE_ENV || 'development'
      }
    });

    // Enhanced request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const startTime = performance.now();
        config.metadata = { startTime };
        
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Add citizen OID for audit tracking
        const currentOid = localStorage.getItem('currentCitizenOid');
        if (currentOid) {
          config.headers['X-Citizen-OID'] = currentOid;
        }

        // Add request timestamp and unique ID
        config.headers['X-Request-Time'] = new Date().toISOString();
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add geographic and device context
        config.headers['X-User-Agent'] = navigator.userAgent;
        config.headers['X-Language'] = navigator.language;
        config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Log request for audit
        auditLogger.dataAccess('API_REQUEST_INITIATED', {
          method: config.method?.toUpperCase(),
          url: this.sanitizeUrl(config.url),
          requestId: config.headers['X-Request-ID'],
          timestamp: new Date().toISOString()
        });
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        auditLogger.system('API_REQUEST_INTERCEPTOR_ERROR', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor
    this.api.interceptors.response.use(
      (response) => {
        const endTime = performance.now();
        const responseTime = endTime - response.config.metadata.startTime;
        
        // Record performance metrics
        if (monitoringService) {
          monitoringService.recordAPIMetric(
            response.config.url,
            response.status,
            responseTime
          );
        }
        
        // Log successful response
        auditLogger.dataAccess('API_RESPONSE_SUCCESS', {
          method: response.config.method?.toUpperCase(),
          url: this.sanitizeUrl(response.config.url),
          status: response.status,
          responseTime: Math.round(responseTime),
          requestId: response.config.headers['X-Request-ID'],
          timestamp: new Date().toISOString()
        });
        
        this.logAPIAccess(response.config, response.status, 'success', responseTime);
        
        return response;
      },
      (error) => {
        const endTime = performance.now();
        const responseTime = error.config?.metadata?.startTime 
          ? endTime - error.config.metadata.startTime 
          : 0;
        
        // Record error metrics
        if (monitoringService) {
          monitoringService.recordAPIMetric(
            error.config?.url || 'unknown',
            error.response?.status || 0,
            responseTime
          );
        }
        
        // Log error response
        auditLogger.dataAccess('API_RESPONSE_ERROR', {
          method: error.config?.method?.toUpperCase(),
          url: this.sanitizeUrl(error.config?.url),
          status: error.response?.status || 0,
          error: error.message,
          responseTime: Math.round(responseTime),
          requestId: error.config?.headers?.['X-Request-ID'],
          timestamp: new Date().toISOString()
        });
        
        this.logAPIAccess(error.config, error.response?.status || 0, 'error', responseTime);
        
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // ===========================================
  // PRODUCTION DATA METHODS
  // ===========================================

  /**
   * Get citizen data from government databases (PRODUCTION)
   */
  async getCitizenByOid(oid) {
    try {
      if (this.mockData) {
        return this.getMockCitizenData(oid);
      }

      // Production: Get citizen data from National Records Office
      const response = await databaseService.executeQuery(
        'external',
        'nationalRecords',
        `/citizens/${oid}`,
        'GET'
      );

      // Validate and enrich citizen data
      const citizenData = await this.enrichCitizenData(response.data);
      
      // Record blockchain audit trail
      await blockchainService.recordIdentityAccess({
        citizenOid: oid,
        accessType: 'profile_view',
        timestamp: new Date().toISOString()
      });

      // Track in monitoring
      if (monitoringService) {
        monitoringService.recordMetric('citizen_data_access', 1, {
          citizenOid: oid,
          source: 'national_records'
        });
      }

      return citizenData;

    } catch (error) {
      console.error('Failed to get citizen data:', error);
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem(`citizen_${oid}`);
      if (cachedData) {
        console.log('Returning cached citizen data');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  }

  /**
   * Get citizen ministry data (PRODUCTION)
   */
  async getCitizenMinistryData(oid, ministryName, dataType = null) {
    try {
      if (this.mockData) {
        return this.getMockMinistryData(oid, ministryName, dataType);
      }

      // Production: Get data from specific ministry
      const data = await ministryIntegrationService.getCitizenData(
        ministryName,
        oid,
        dataType
      );

      // Cache frequently accessed data
      this.cacheMinistryData(oid, ministryName, dataType, data);

      return data;

    } catch (error) {
      console.error(`Failed to get ${ministryName} data for citizen ${oid}:`, error);
      
      // Try cached data
      const cachedData = this.getCachedMinistryData(oid, ministryName, dataType);
      if (cachedData) {
        return cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Submit application to ministry (PRODUCTION)
   */
  async submitMinistryApplication(oid, ministryName, applicationData) {
    try {
      if (this.mockData) {
        return this.getMockApplicationSubmission(oid, ministryName, applicationData);
      }

      // Production: Submit to actual ministry system
      const result = await ministryIntegrationService.submitApplication(
        ministryName,
        oid,
        applicationData
      );

      // Record to blockchain for transparency
      await blockchainService.recordApplicationSubmission({
        citizenOid: oid,
        ministry: ministryName,
        applicationId: result.applicationId,
        type: applicationData.type,
        timestamp: new Date().toISOString()
      });

      // Track application submission
      if (window.trackApplicationSubmission) {
        window.trackApplicationSubmission(ministryName, applicationData.type, result.status);
      }

      return result;

    } catch (error) {
      console.error(`Failed to submit application to ${ministryName}:`, error);
      throw error;
    }
  }

  /**
   * Verify citizen identity with biometrics (PRODUCTION)
   */
  async verifyBiometricIdentity(oid, biometricData) {
    try {
      if (this.mockData) {
        return { verified: true, confidence: 0.95, method: 'mock' };
      }

      // Production: Verify with biometric service
      const response = await databaseService.executeQuery(
        'external',
        'biometric',
        '/verify',
        'POST',
        {
          citizenOid: oid,
          biometricData,
          timestamp: new Date().toISOString()
        }
      );

      // Record verification attempt
      await blockchainService.recordBiometricVerification({
        citizenOid: oid,
        method: biometricData.type,
        result: response.verified,
        timestamp: new Date().toISOString()
      });

      return response;

    } catch (error) {
      console.error('Biometric verification failed:', error);
      throw error;
    }
  }

  /**
   * Get real-time government statistics (PRODUCTION)
   */
  async getGovernmentStatistics() {
    try {
      if (this.mockData) {
        return this.getMockGovernmentStatistics();
      }

      // Get statistics from all ministries
      const stats = {};
      
      for (const ministry of Object.keys(ministryIntegrationService.ministries)) {
        try {
          stats[ministry] = await ministryIntegrationService.getMinistryStatistics(ministry);
        } catch (error) {
          console.warn(`Failed to get statistics for ${ministry}:`, error);
          stats[ministry] = { error: error.message };
        }
      }

      // Add system health metrics
      stats.system = {
        uptime: monitoringService?.getAnalyticsSummary()?.uptime || 0,
        activeUsers: monitoringService?.activeUsers?.size || 0,
        requestsCount: monitoringService?.requestCount || 0,
        errorRate: monitoringService?.getPerformanceMetrics()?.errorRate || 0
      };

      return stats;

    } catch (error) {
      console.error('Failed to get government statistics:', error);
      throw error;
    }
  }

  /**
   * Get system health status (PRODUCTION)
   */
  async getSystemHealth() {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        components: {}
      };

      // Check database connections
      health.components.database = databaseService.getHealthStatus();

      // Check ministry integrations
      health.components.ministries = await ministryIntegrationService.getSystemHealth();

      // Check monitoring service
      if (monitoringService) {
        health.components.monitoring = monitoringService.performHealthCheck();
      }

      // Check blockchain service
      health.components.blockchain = await blockchainService.getNetworkStatus();

      // Determine overall health
      const unhealthyComponents = Object.values(health.components)
        .filter(component => component.status !== 'healthy' && component.status !== 'connected');
      
      if (unhealthyComponents.length > 0) {
        health.status = unhealthyComponents.length > 2 ? 'critical' : 'degraded';
      }

      return health;

    } catch (error) {
      console.error('Failed to get system health:', error);
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      };
    }
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

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize URL for logging (remove sensitive parameters)
   */
  sanitizeUrl(url) {
    if (!url) return 'unknown';
    return url.replace(/([?&])(token|key|password|secret|oid)=[^&]*/gi, '$1$2=***');
  }

  /**
   * Enhanced error handling with context
   */
  handleError(error) {
    // Record error for monitoring
    if (monitoringService) {
      monitoringService.recordError('API_ERROR', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
    }

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
        case 503:
          return new Error('Service temporarily unavailable. Please try again later.');
        default:
          return new Error(data?.message || `Server error: ${status}`);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your internet connection.');
    } else {
      return new Error('Request failed. Please try again.');
    }
  }

  /**
   * Enhanced unauthorized handling
   */
  handleUnauthorized() {
    auditLogger.auth('UNAUTHORIZED_ACCESS_DETECTED', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Clear authentication
    this.clearAuth();
    
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?returnUrl=${returnUrl}`;
  }

  /**
   * Set authentication token with validation
   */
  setAuthToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid authentication token');
    }

    this.authToken = token;
    localStorage.setItem('authToken', token);
    
    auditLogger.auth('AUTH_TOKEN_SET', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Clear authentication and related data
   */
  clearAuth() {
    this.authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentCitizenOid');
    sessionStorage.clear();
    
    auditLogger.auth('AUTH_CLEARED', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Enrich citizen data with additional information
   */
  async enrichCitizenData(citizenData) {
    try {
      // Add real-time verification status
      citizenData.verificationStatus = await this.getVerificationStatus(citizenData.oid);
      
      // Add location information if available
      if (citizenData.address) {
        citizenData.addressValidation = await this.validateAddress(citizenData.address);
      }
      
      // Add biometric status
      citizenData.biometricStatus = await this.getBiometricStatus(citizenData.oid);
      
      // Cache enriched data
      localStorage.setItem(`citizen_${citizenData.oid}`, JSON.stringify({
        ...citizenData,
        cacheTimestamp: Date.now()
      }));
      
      return citizenData;
      
    } catch (error) {
      console.warn('Failed to enrich citizen data:', error);
      return citizenData; // Return original data if enrichment fails
    }
  }

  /**
   * Cache ministry data for offline access
   */
  cacheMinistryData(oid, ministry, dataType, data) {
    try {
      const cacheKey = `ministry_${ministry}_${oid}_${dataType || 'all'}`;
      const cachedData = {
        data,
        timestamp: Date.now(),
        ministry,
        oid,
        dataType
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      console.warn('Failed to cache ministry data:', error);
    }
  }

  /**
   * Get cached ministry data
   */
  getCachedMinistryData(oid, ministry, dataType) {
    try {
      const cacheKey = `ministry_${ministry}_${oid}_${dataType || 'all'}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const parsedData = JSON.parse(cached);
        const cacheAge = Date.now() - parsedData.timestamp;
        
        // Return cached data if less than 1 hour old
        if (cacheAge < 3600000) {
          console.log(`Using cached data for ${ministry} ${dataType}`);
          return parsedData.data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get cached ministry data:', error);
      return null;
    }
  }

  /**
   * Get verification status for citizen
   */
  async getVerificationStatus(oid) {
    try {
      const response = await databaseService.executeQuery(
        'external',
        'nationalRecords',
        `/citizens/${oid}/verification`,
        'GET'
      );
      return response.data;
    } catch (error) {
      return { verified: false, reason: 'verification_unavailable' };
    }
  }

  /**
   * Validate address with Sudan Post
   */
  async validateAddress(address) {
    try {
      const response = await databaseService.executeQuery(
        'external',
        'sudanPost',
        '/validate-address',
        'POST',
        { address }
      );
      return response.data;
    } catch (error) {
      return { valid: false, reason: 'validation_unavailable' };
    }
  }

  /**
   * Get biometric status for citizen
   */
  async getBiometricStatus(oid) {
    try {
      const response = await databaseService.executeQuery(
        'external',
        'biometric',
        `/status/${oid}`,
        'GET'
      );
      return response.data;
    } catch (error) {
      return { enrolled: false, methods: [] };
    }
  }

  // ===========================================
  // MOCK DATA METHODS (Development/Testing)
  // ===========================================

  /**
   * Get mock citizen data for development
   */
  getMockCitizenData(oid) {
    return {
      oid,
      personalInfo: {
        fullName: {
          ar: 'أحمد محمد عبدالله',
          en: 'Ahmed Mohammed Abdullah'
        },
        gender: 'male',
        dateOfBirth: '1985-03-15',
        placeOfBirth: 'Khartoum',
        nationality: 'Sudanese'
      },
      identity: {
        nationalId: '123456789',
        passportNumber: 'P12345678',
        biometricStatus: {
          enrolled: true,
          methods: ['fingerprint', 'facial', 'iris'],
          lastUpdate: '2023-12-01'
        }
      },
      contact: {
        phone: '+249123456789',
        email: 'ahmed.mohammed@example.com',
        address: {
          ar: 'الخرطوم، السودان',
          en: 'Khartoum, Sudan'
        }
      },
      verification: {
        verified: true,
        verificationLevel: 'high',
        lastVerified: '2023-12-01'
      },
      government: {
        taxId: 'TAX123456789',
        socialSecurityNumber: 'SSN123456789',
        voterRegistration: 'VR123456789'
      },
      status: 'active',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get mock ministry data for development
   */
  getMockMinistryData(oid, ministryName, dataType) {
    const baseData = {
      oid,
      ministry: ministryName,
      dataType: dataType || 'all',
      lastUpdated: new Date().toISOString()
    };

    switch (ministryName) {
      case 'health':
        return {
          ...baseData,
          medicalHistory: [
            {
              date: '2023-11-15',
              diagnosis: 'Routine Checkup',
              doctor: 'Dr. Sarah Ahmed',
              hospital: 'Khartoum Teaching Hospital'
            }
          ],
          vaccinations: [
            {
              vaccine: 'COVID-19',
              date: '2023-01-15',
              dose: 'Booster',
              location: 'National Vaccination Center'
            }
          ],
          insurance: {
            provider: 'Sudan National Health Insurance',
            number: 'SNHI' + oid.slice(-8),
            status: 'active',
            coverage: 'comprehensive'
          }
        };

      case 'education':
        return {
          ...baseData,
          qualifications: [
            {
              level: 'Bachelor',
              field: 'Computer Science',
              institution: 'University of Khartoum',
              year: 2012,
              grade: 'First Class Honours'
            }
          ],
          certifications: [
            {
              name: 'Professional IT Certificate',
              issuer: 'Sudan IT Authority',
              date: '2023-06-15',
              status: 'valid',
              expiryDate: '2025-06-15'
            }
          ],
          currentEnrollment: null
        };

      case 'finance':
        return {
          ...baseData,
          taxRecords: [
            {
              year: 2023,
              status: 'filed',
              amount: 15000,
              refund: 0,
              dueDate: '2024-04-15'
            }
          ],
          businessLicenses: [
            {
              licenseNumber: 'BL' + oid.slice(-6),
              businessType: 'IT Services',
              status: 'active',
              expiryDate: '2024-12-31'
            }
          ],
          governmentPayments: [
            {
              date: '2023-12-01',
              amount: 500,
              type: 'Service Fee',
              status: 'completed'
            }
          ]
        };

      default:
        return {
          ...baseData,
          records: [
            {
              id: Date.now(),
              type: 'general_record',
              description: `Mock data for ${ministryName}`,
              date: new Date().toISOString(),
              status: 'active'
            }
          ]
        };
    }
  }

  /**
   * Get mock application submission response
   */
  getMockApplicationSubmission(oid, ministryName, applicationData) {
    const applicationId = `${ministryName.toUpperCase()}-${Date.now()}-${oid.slice(-4)}`;
    
    return {
      applicationId,
      citizenOid: oid,
      ministry: ministryName,
      type: applicationData.type,
      status: 'submitted',
      submissionDate: new Date().toISOString(),
      estimatedProcessingTime: '5-10 business days',
      trackingNumber: `TRK-${applicationId}`,
      nextSteps: [
        'Application received and under review',
        'Document verification in progress',
        'Approval decision pending'
      ],
      requiredDocuments: applicationData.documents || [],
      fees: {
        amount: applicationData.feeAmount || 100,
        currency: 'SDG',
        status: 'pending'
      },
      contactInfo: {
        email: `${ministryName}@sd.brainsait.com`,
        phone: '+249123456789',
        office: `${ministryName} Ministry - Citizen Services`
      }
    };
  }

  /**
   * Get mock government statistics
   */
  getMockGovernmentStatistics() {
    return {
      timestamp: new Date().toISOString(),
      totalCitizens: 45000000,
      activeCitizens: 32000000,
      digitalAdoption: 78.5,
      servicesAvailable: 156,
      applicationsProcessed: {
        today: 15420,
        thisWeek: 98750,
        thisMonth: 425000
      },
      ministryStats: {
        health: {
          totalServices: 25,
          activeUsers: 8500000,
          avgResponseTime: '2.3 days'
        },
        education: {
          totalServices: 18,
          activeUsers: 12000000,
          avgResponseTime: '1.8 days'
        },
        finance: {
          totalServices: 22,
          activeUsers: 15000000,
          avgResponseTime: '3.1 days'
        },
        agriculture: {
          totalServices: 15,
          activeUsers: 3500000,
          avgResponseTime: '2.7 days'
        }
      },
      systemPerformance: {
        uptime: 99.8,
        avgResponseTime: 1.2,
        errorRate: 0.02,
        throughput: 50000
      }
    };
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
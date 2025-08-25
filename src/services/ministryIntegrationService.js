// Sudan Government Ministry Integration Service
// Production-ready API integration for all government ministries

import databaseService from './databaseService';
import auditLogger from '../security/AuditLogger';

/**
 * Government Ministry Integration Layer
 * Handles real-time data exchange with all Sudan government ministries
 */
class MinistryIntegrationService {
  constructor() {
    this.ministries = {
      health: new HealthMinistryAPI(),
      education: new EducationMinistryAPI(),
      finance: new FinanceMinistryAPI(),
      agriculture: new AgricultureMinistryAPI(),
      energy: new EnergyMinistryAPI(),
      infrastructure: new InfrastructureMinistryAPI(),
      justice: new JusticeMinistryAPI(),
      foreignAffairs: new ForeignAffairsMinistryAPI(),
      labor: new LaborMinistryAPI(),
      socialWelfare: new SocialWelfareMinistryAPI()
    };
    
    this.dataCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  /**
   * Get citizen data from specific ministry
   */
  async getCitizenData(ministryName, citizenOid, dataType = null) {
    try {
      const ministry = this.ministries[ministryName];
      if (!ministry) {
        throw new Error(`Unknown ministry: ${ministryName}`);
      }

      auditLogger.dataAccess('MINISTRY_DATA_REQUEST', {
        ministry: ministryName,
        citizenOid,
        dataType,
        timestamp: new Date().toISOString()
      });

      const data = await ministry.getCitizenData(citizenOid, dataType);
      
      auditLogger.dataAccess('MINISTRY_DATA_RETRIEVED', {
        ministry: ministryName,
        citizenOid,
        dataType,
        recordCount: data?.records?.length || 0,
        timestamp: new Date().toISOString()
      });

      return data;
      
    } catch (error) {
      auditLogger.dataAccess('MINISTRY_DATA_ERROR', {
        ministry: ministryName,
        citizenOid,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Submit application to ministry
   */
  async submitApplication(ministryName, citizenOid, applicationData) {
    try {
      const ministry = this.ministries[ministryName];
      if (!ministry) {
        throw new Error(`Unknown ministry: ${ministryName}`);
      }

      auditLogger.dataAccess('MINISTRY_APPLICATION_SUBMIT', {
        ministry: ministryName,
        citizenOid,
        applicationType: applicationData.type,
        timestamp: new Date().toISOString()
      });

      const result = await ministry.submitApplication(citizenOid, applicationData);
      
      auditLogger.dataAccess('MINISTRY_APPLICATION_SUBMITTED', {
        ministry: ministryName,
        citizenOid,
        applicationId: result.applicationId,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      return result;
      
    } catch (error) {
      auditLogger.dataAccess('MINISTRY_APPLICATION_ERROR', {
        ministry: ministryName,
        citizenOid,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get ministry statistics for dashboard
   */
  async getMinistryStatistics(ministryName) {
    try {
      const ministry = this.ministries[ministryName];
      if (!ministry) {
        throw new Error(`Unknown ministry: ${ministryName}`);
      }

      const stats = await ministry.getStatistics();
      return stats;
      
    } catch (error) {
      console.error(`Failed to get statistics for ${ministryName}:`, error);
      return null;
    }
  }

  /**
   * Get all ministries health status
   */
  async getSystemHealth() {
    const health = {};
    
    for (const [name, ministry] of Object.entries(this.ministries)) {
      try {
        health[name] = await ministry.healthCheck();
      } catch (error) {
        health[name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return health;
  }
}

/**
 * Base Ministry API Class
 */
class BaseMinistryAPI {
  constructor(ministryName) {
    this.ministryName = ministryName;
    this.baseUrl = process.env[`REACT_APP_${ministryName.toUpperCase()}_API_URL`];
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return await databaseService.executeQuery(
      'ministry',
      this.ministryName,
      endpoint,
      method,
      data
    );
  }

  async healthCheck() {
    try {
      const result = await this.makeRequest('/health');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ...result
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Health Ministry API Integration
 * Connects to DHIS2 and health information systems
 */
class HealthMinistryAPI extends BaseMinistryAPI {
  constructor() {
    super('health');
  }

  async getCitizenData(citizenOid, dataType) {
    const endpoints = {
      'medical-history': `/patients/${citizenOid}/history`,
      'vaccinations': `/patients/${citizenOid}/vaccinations`,
      'appointments': `/patients/${citizenOid}/appointments`,
      'prescriptions': `/patients/${citizenOid}/prescriptions`,
      'insurance': `/patients/${citizenOid}/insurance`
    };

    if (dataType && endpoints[dataType]) {
      return await this.makeRequest(endpoints[dataType]);
    }

    // Get all health data
    const healthData = {};
    for (const [type, endpoint] of Object.entries(endpoints)) {
      try {
        healthData[type] = await this.makeRequest(endpoint);
      } catch (error) {
        healthData[type] = { error: error.message };
      }
    }

    return healthData;
  }

  async submitApplication(citizenOid, applicationData) {
    const { type, data } = applicationData;
    
    const endpoints = {
      'appointment': '/appointments',
      'vaccination-certificate': '/certificates/vaccination',
      'medical-certificate': '/certificates/medical',
      'insurance-registration': '/insurance/register'
    };

    if (!endpoints[type]) {
      throw new Error(`Unknown health application type: ${type}`);
    }

    return await this.makeRequest(endpoints[type], 'POST', {
      citizenOid,
      ...data
    });
  }

  async getStatistics() {
    return await this.makeRequest('/statistics');
  }
}

/**
 * Education Ministry API Integration
 */
class EducationMinistryAPI extends BaseMinistryAPI {
  constructor() {
    super('education');
  }

  async getCitizenData(citizenOid, dataType) {
    const endpoints = {
      'academic-records': `/students/${citizenOid}/records`,
      'certificates': `/students/${citizenOid}/certificates`,
      'enrollments': `/students/${citizenOid}/enrollments`,
      'examination-results': `/students/${citizenOid}/exams`
    };

    if (dataType && endpoints[dataType]) {
      return await this.makeRequest(endpoints[dataType]);
    }

    const educationData = {};
    for (const [type, endpoint] of Object.entries(endpoints)) {
      try {
        educationData[type] = await this.makeRequest(endpoint);
      } catch (error) {
        educationData[type] = { error: error.message };
      }
    }

    return educationData;
  }

  async submitApplication(citizenOid, applicationData) {
    const { type, data } = applicationData;
    
    const endpoints = {
      'enrollment': '/enrollment',
      'certificate-request': '/certificates/request',
      'transcript-request': '/transcripts/request',
      'transfer-request': '/transfers'
    };

    if (!endpoints[type]) {
      throw new Error(`Unknown education application type: ${type}`);
    }

    return await this.makeRequest(endpoints[type], 'POST', {
      citizenOid,
      ...data
    });
  }

  async getStatistics() {
    return await this.makeRequest('/statistics');
  }
}

/**
 * Finance Ministry API Integration
 * Connects to IFMIS and tax systems
 */
class FinanceMinistryAPI extends BaseMinistryAPI {
  constructor() {
    super('finance');
  }

  async getCitizenData(citizenOid, dataType) {
    const endpoints = {
      'tax-records': `/taxpayers/${citizenOid}/records`,
      'payments': `/taxpayers/${citizenOid}/payments`,
      'refunds': `/taxpayers/${citizenOid}/refunds`,
      'business-licenses': `/taxpayers/${citizenOid}/licenses`,
      'government-payments': `/citizens/${citizenOid}/gov-payments`
    };

    if (dataType && endpoints[dataType]) {
      return await this.makeRequest(endpoints[dataType]);
    }

    const financeData = {};
    for (const [type, endpoint] of Object.entries(endpoints)) {
      try {
        financeData[type] = await this.makeRequest(endpoint);
      } catch (error) {
        financeData[type] = { error: error.message };
      }
    }

    return financeData;
  }

  async submitApplication(citizenOid, applicationData) {
    const { type, data } = applicationData;
    
    const endpoints = {
      'tax-return': '/tax-returns',
      'business-license': '/licenses/business',
      'tax-exemption': '/exemptions',
      'payment': '/payments'
    };

    if (!endpoints[type]) {
      throw new Error(`Unknown finance application type: ${type}`);
    }

    return await this.makeRequest(endpoints[type], 'POST', {
      citizenOid,
      ...data
    });
  }

  async getStatistics() {
    return await this.makeRequest('/statistics');
  }
}

/**
 * Agriculture Ministry API Integration
 */
class AgricultureMinistryAPI extends BaseMinistryAPI {
  constructor() {
    super('agriculture');
  }

  async getCitizenData(citizenOid, dataType) {
    const endpoints = {
      'farmer-registration': `/farmers/${citizenOid}/profile`,
      'land-ownership': `/farmers/${citizenOid}/land`,
      'subsidies': `/farmers/${citizenOid}/subsidies`,
      'crop-data': `/farmers/${citizenOid}/crops`,
      'livestock': `/farmers/${citizenOid}/livestock`
    };

    if (dataType && endpoints[dataType]) {
      return await this.makeRequest(endpoints[dataType]);
    }

    const agricultureData = {};
    for (const [type, endpoint] of Object.entries(endpoints)) {
      try {
        agricultureData[type] = await this.makeRequest(endpoint);
      } catch (error) {
        agricultureData[type] = { error: error.message };
      }
    }

    return agricultureData;
  }

  async submitApplication(citizenOid, applicationData) {
    const { type, data } = applicationData;
    
    const endpoints = {
      'farmer-registration': '/farmers/register',
      'subsidy-application': '/subsidies/apply',
      'land-registration': '/land/register',
      'crop-insurance': '/insurance/crop'
    };

    if (!endpoints[type]) {
      throw new Error(`Unknown agriculture application type: ${type}`);
    }

    return await this.makeRequest(endpoints[type], 'POST', {
      citizenOid,
      ...data
    });
  }

  async getStatistics() {
    return await this.makeRequest('/statistics');
  }
}

// Placeholder implementations for remaining ministries
class EnergyMinistryAPI extends BaseMinistryAPI {
  constructor() { super('energy'); }
  async getCitizenData(citizenOid, dataType) { return await this.makeRequest(`/citizens/${citizenOid}`); }
  async submitApplication(citizenOid, applicationData) { return await this.makeRequest('/applications', 'POST', { citizenOid, ...applicationData }); }
  async getStatistics() { return await this.makeRequest('/statistics'); }
}

class InfrastructureMinistryAPI extends BaseMinistryAPI {
  constructor() { super('infrastructure'); }
  async getCitizenData(citizenOid, dataType) { return await this.makeRequest(`/citizens/${citizenOid}`); }
  async submitApplication(citizenOid, applicationData) { return await this.makeRequest('/applications', 'POST', { citizenOid, ...applicationData }); }
  async getStatistics() { return await this.makeRequest('/statistics'); }
}

class JusticeMinistryAPI extends BaseMinistryAPI {
  constructor() { super('justice'); }
  async getCitizenData(citizenOid, dataType) { return await this.makeRequest(`/citizens/${citizenOid}`); }
  async submitApplication(citizenOid, applicationData) { return await this.makeRequest('/applications', 'POST', { citizenOid, ...applicationData }); }
  async getStatistics() { return await this.makeRequest('/statistics'); }
}

class ForeignAffairsMinistryAPI extends BaseMinistryAPI {
  constructor() { super('foreignAffairs'); }
  async getCitizenData(citizenOid, dataType) { return await this.makeRequest(`/citizens/${citizenOid}`); }
  async submitApplication(citizenOid, applicationData) { return await this.makeRequest('/applications', 'POST', { citizenOid, ...applicationData }); }
  async getStatistics() { return await this.makeRequest('/statistics'); }
}

class LaborMinistryAPI extends BaseMinistryAPI {
  constructor() { super('labor'); }
  async getCitizenData(citizenOid, dataType) { return await this.makeRequest(`/citizens/${citizenOid}`); }
  async submitApplication(citizenOid, applicationData) { return await this.makeRequest('/applications', 'POST', { citizenOid, ...applicationData }); }
  async getStatistics() { return await this.makeRequest('/statistics'); }
}

class SocialWelfareMinistryAPI extends BaseMinistryAPI {
  constructor() { super('socialWelfare'); }
  async getCitizenData(citizenOid, dataType) { return await this.makeRequest(`/citizens/${citizenOid}`); }
  async submitApplication(citizenOid, applicationData) { return await this.makeRequest('/applications', 'POST', { citizenOid, ...applicationData }); }
  async getStatistics() { return await this.makeRequest('/statistics'); }
}

// Create singleton instance
const ministryIntegrationService = new MinistryIntegrationService();

export default ministryIntegrationService;
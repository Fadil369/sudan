// Sudan Digital Identity Blockchain Service
// Hyperledger Fabric integration for immutable audit trails

import CryptoJS from 'crypto-js';

class BlockchainService {
  constructor() {
    this.networkConfig = {
      channelName: 'sudan-identity-channel',
      chaincodeName: 'sudan-identity-chaincode',
      mspId: 'SudanGovMSP',
      caUrl: process.env.REACT_APP_BLOCKCHAIN_CA_URL || 'https://ca.sudan-blockchain.gov.sd',
      peerUrl: process.env.REACT_APP_BLOCKCHAIN_PEER_URL || 'grpc://peer0.sudan-blockchain.gov.sd:7051',
      ordererUrl: process.env.REACT_APP_BLOCKCHAIN_ORDERER_URL || 'grpc://orderer.sudan-blockchain.gov.sd:7050',
      walletPath: './wallet',
      connectionProfilePath: './connection-profile.json'
    };

    this.isConnected = false;
    this.gateway = null;
    this.network = null;
    this.contract = null;

    // Initialize connection
    this.initializeConnection();
  }

  // Initialize Hyperledger Fabric connection
  async initializeConnection() {
    try {
      // Note: In a real implementation, this would use fabric-network SDK
      // For this demo, we simulate the blockchain interaction
      
      console.log('🔗 Initializing blockchain connection...');
      console.log(`📡 Connecting to: ${this.networkConfig.peerUrl}`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      console.log('✅ Blockchain connection established');
      
      // Set up event listeners for block events
      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Blockchain connection failed:', error);
      this.isConnected = false;
    }
  }

  // Set up blockchain event listeners
  setupEventListeners() {
    // Listen for new blocks
    console.log('👂 Setting up blockchain event listeners...');
    
    // Simulate periodic block events
    setInterval(() => {
      if (this.isConnected) {
        this.emitBlockEvent({
          blockNumber: Math.floor(Date.now() / 1000),
          timestamp: new Date().toISOString(),
          transactionCount: Math.floor(Math.random() * 10) + 1
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Emit block event
  emitBlockEvent(blockInfo) {
    const event = new CustomEvent('blockchain-block', {
      detail: blockInfo
    });
    window.dispatchEvent(event);
  }

  // Record identity creation on blockchain
  async recordIdentityCreation(oidData) {
    if (!this.isConnected) {
      throw new Error('Blockchain not connected');
    }

    try {
      const transaction = {
        id: this.generateTransactionId(),
        type: 'IDENTITY_CREATED',
        timestamp: new Date().toISOString(),
        data: {
          oid: oidData.oid,
          citizenId: oidData.citizenId,
          ministryId: oidData.ministryId,
          hash: this.hashData(oidData),
          metadata: {
            createdBy: oidData.createdBy,
            location: oidData.location,
            deviceInfo: oidData.deviceInfo
          }
        }
      };

      // Simulate blockchain transaction
      console.log('📝 Recording identity creation on blockchain:', transaction.id);
      
      // Add to blockchain (simulated)
      await this.submitTransaction(transaction);
      
      return {
        success: true,
        transactionId: transaction.id,
        blockHash: this.generateBlockHash(),
        timestamp: transaction.timestamp
      };

    } catch (error) {
      console.error('❌ Failed to record identity creation:', error);
      throw error;
    }
  }

  // Record service access on blockchain
  async recordServiceAccess(accessData) {
    if (!this.isConnected) {
      throw new Error('Blockchain not connected');
    }

    try {
      const transaction = {
        id: this.generateTransactionId(),
        type: 'SERVICE_ACCESSED',
        timestamp: new Date().toISOString(),
        data: {
          oid: accessData.oid,
          serviceId: accessData.serviceId,
          ministryId: accessData.ministryId,
          actionType: accessData.actionType, // 'READ', 'WRITE', 'UPDATE', 'DELETE'
          hash: this.hashData(accessData),
          metadata: {
            userId: accessData.userId,
            sessionId: accessData.sessionId,
            ipAddress: accessData.ipAddress,
            userAgent: accessData.userAgent,
            location: accessData.location
          }
        }
      };

      console.log('📝 Recording service access on blockchain:', transaction.id);
      
      await this.submitTransaction(transaction);
      
      return {
        success: true,
        transactionId: transaction.id,
        blockHash: this.generateBlockHash(),
        timestamp: transaction.timestamp
      };

    } catch (error) {
      console.error('❌ Failed to record service access:', error);
      throw error;
    }
  }

  // Record data modification on blockchain
  async recordDataModification(modificationData) {
    if (!this.isConnected) {
      throw new Error('Blockchain not connected');
    }

    try {
      const transaction = {
        id: this.generateTransactionId(),
        type: 'DATA_MODIFIED',
        timestamp: new Date().toISOString(),
        data: {
          oid: modificationData.oid,
          fieldName: modificationData.fieldName,
          oldValueHash: this.hashData(modificationData.oldValue),
          newValueHash: this.hashData(modificationData.newValue),
          reason: modificationData.reason,
          hash: this.hashData(modificationData),
          metadata: {
            modifiedBy: modificationData.modifiedBy,
            approvedBy: modificationData.approvedBy,
            ministryId: modificationData.ministryId,
            requestId: modificationData.requestId
          }
        }
      };

      console.log('📝 Recording data modification on blockchain:', transaction.id);
      
      await this.submitTransaction(transaction);
      
      return {
        success: true,
        transactionId: transaction.id,
        blockHash: this.generateBlockHash(),
        timestamp: transaction.timestamp
      };

    } catch (error) {
      console.error('❌ Failed to record data modification:', error);
      throw error;
    }
  }

  // Record consent given/revoked
  async recordConsent(consentData) {
    if (!this.isConnected) {
      throw new Error('Blockchain not connected');
    }

    try {
      const transaction = {
        id: this.generateTransactionId(),
        type: consentData.granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
        timestamp: new Date().toISOString(),
        data: {
          oid: consentData.oid,
          serviceId: consentData.serviceId,
          consentType: consentData.consentType, // 'DATA_SHARING', 'BIOMETRIC', 'LOCATION', etc.
          granted: consentData.granted,
          expiryDate: consentData.expiryDate,
          hash: this.hashData(consentData),
          metadata: {
            consentGivenBy: consentData.consentGivenBy,
            witnessId: consentData.witnessId,
            deviceId: consentData.deviceId
          }
        }
      };

      console.log('📝 Recording consent on blockchain:', transaction.id);
      
      await this.submitTransaction(transaction);
      
      return {
        success: true,
        transactionId: transaction.id,
        blockHash: this.generateBlockHash(),
        timestamp: transaction.timestamp
      };

    } catch (error) {
      console.error('❌ Failed to record consent:', error);
      throw error;
    }
  }

  // Query audit trail for a specific OID
  async queryAuditTrail(oid, options = {}) {
    if (!this.isConnected) {
      throw new Error('Blockchain not connected');
    }

    try {
      console.log('🔍 Querying audit trail for OID:', oid);
      
      // Simulate blockchain query
      const mockAuditTrail = this.generateMockAuditTrail(oid, options);
      
      return {
        success: true,
        oid: oid,
        totalRecords: mockAuditTrail.length,
        records: mockAuditTrail,
        queryTimestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to query audit trail:', error);
      throw error;
    }
  }

  // Verify transaction integrity
  async verifyTransaction(transactionId) {
    if (!this.isConnected) {
      throw new Error('Blockchain not connected');
    }

    try {
      console.log('🔒 Verifying transaction:', transactionId);
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        transactionId: transactionId,
        verified: true,
        blockNumber: Math.floor(Date.now() / 1000),
        confirmations: Math.floor(Math.random() * 100) + 10,
        verificationTimestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to verify transaction:', error);
      throw error;
    }
  }

  // Get blockchain network status
  async getNetworkStatus() {
    try {
      // Simulate network status check
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        connected: this.isConnected,
        networkId: 'sudan-identity-network',
        peersConnected: Math.floor(Math.random() * 5) + 3,
        blockHeight: Math.floor(Date.now() / 1000),
        lastBlockTime: new Date().toISOString(),
        chaincodeName: this.networkConfig.chaincodeName,
        channelName: this.networkConfig.channelName,
        consensusAlgorithm: 'PBFT',
        networkHealth: 'healthy'
      };

    } catch (error) {
      console.error('❌ Failed to get network status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Submit transaction to blockchain (simulated)
  async submitTransaction(transaction) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Transaction failed: Network congestion');
    }
    
    console.log('✅ Transaction submitted successfully:', transaction.id);
    return true;
  }

  // Generate transaction ID
  generateTransactionId() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  // Generate block hash
  generateBlockHash() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  // Hash data for integrity verification
  hashData(data) {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  }

  // Generate mock audit trail for demo
  generateMockAuditTrail(oid, options = {}) {
    const limit = options.limit || 50;
    const records = [];
    
    const transactionTypes = [
      'IDENTITY_CREATED',
      'SERVICE_ACCESSED', 
      'DATA_MODIFIED',
      'CONSENT_GRANTED',
      'CONSENT_REVOKED'
    ];

    const ministries = [
      'health',
      'education', 
      'interior',
      'finance',
      'energy',
      'infrastructure',
      'justice'
    ];

    for (let i = 0; i < Math.min(limit, 20); i++) {
      const timestamp = new Date(Date.now() - (i * Math.random() * 30 * 24 * 60 * 60 * 1000));
      
      records.push({
        transactionId: this.generateTransactionId(),
        blockHash: this.generateBlockHash(),
        blockNumber: Math.floor(Date.now() / 1000) - i,
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        timestamp: timestamp.toISOString(),
        oid: oid,
        ministryId: ministries[Math.floor(Math.random() * ministries.length)],
        verified: true,
        confirmations: Math.floor(Math.random() * 100) + 10
      });
    }

    return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Clean up connections
  async disconnect() {
    try {
      if (this.gateway) {
        await this.gateway.disconnect();
      }
      this.isConnected = false;
      console.log('🔌 Blockchain connection closed');
    } catch (error) {
      console.error('❌ Error disconnecting from blockchain:', error);
    }
  }

  // Export audit data for compliance
  async exportAuditData(oid, format = 'json') {
    try {
      const auditTrail = await this.queryAuditTrail(oid, { limit: 1000 });
      
      if (format === 'csv') {
        return this.convertToCSV(auditTrail.records);
      }
      
      return JSON.stringify(auditTrail, null, 2);
      
    } catch (error) {
      console.error('❌ Failed to export audit data:', error);
      throw error;
    }
  }

  // Convert audit data to CSV format
  convertToCSV(records) {
    if (!records || records.length === 0) return '';
    
    const headers = Object.keys(records[0]).join(',');
    const rows = records.map(record => 
      Object.values(record).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();

// Audit trail utilities
export class AuditTrailManager {
  static async recordOIDCreation(citizenData) {
    return await blockchainService.recordIdentityCreation({
      oid: citizenData.oid,
      citizenId: citizenData.id,
      ministryId: 'interior',
      createdBy: citizenData.createdBy || 'system',
      location: citizenData.birthPlace,
      deviceInfo: navigator.userAgent
    });
  }

  static async recordServiceUsage(oid, serviceId, actionType = 'READ') {
    return await blockchainService.recordServiceAccess({
      oid: oid,
      serviceId: serviceId,
      ministryId: serviceId.split('.')[0], // Extract ministry from service ID
      actionType: actionType,
      userId: localStorage.getItem('currentUserId'),
      sessionId: sessionStorage.getItem('sessionId'),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      location: await this.getCurrentLocation()
    });
  }

  static async recordDataChange(oid, fieldName, oldValue, newValue, reason) {
    return await blockchainService.recordDataModification({
      oid: oid,
      fieldName: fieldName,
      oldValue: oldValue,
      newValue: newValue,
      reason: reason,
      modifiedBy: localStorage.getItem('currentUserId'),
      approvedBy: localStorage.getItem('approverUserId'),
      ministryId: localStorage.getItem('currentMinistry'),
      requestId: `REQ-${Date.now()}`
    });
  }

  static async recordConsent(oid, serviceId, consentType, granted = true, expiryDate = null) {
    return await blockchainService.recordConsent({
      oid: oid,
      serviceId: serviceId,
      consentType: consentType,
      granted: granted,
      expiryDate: expiryDate,
      consentGivenBy: localStorage.getItem('currentUserId'),
      witnessId: null,
      deviceId: await this.getDeviceId()
    });
  }

  static async getAuditHistory(oid) {
    return await blockchainService.queryAuditTrail(oid);
  }

  // Utility methods
  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  static async getCurrentLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => resolve(null),
          { timeout: 5000 }
        );
      } else {
        resolve(null);
      }
    });
  }

  static async getDeviceId() {
    // Generate a consistent device ID based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = canvas.toDataURL() + 
      navigator.userAgent + 
      navigator.language + 
      screen.width + 
      screen.height;
      
    return CryptoJS.SHA256(fingerprint).toString().substring(0, 16);
  }
}

export default BlockchainService;
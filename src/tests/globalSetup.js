module.exports = async () => {
  // Global setup for all tests
  console.log('🧪 Setting up test environment...');
  
  // Set timezone to UTC for consistent date handling
  process.env.TZ = 'UTC';
  
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  
  // Mock environment variables for testing
  process.env.REACT_APP_OID_BASE = '1.3.6.1.4.1.61026.1';
  process.env.REACT_APP_API_URL = 'https://api.test.sudan.gov.sd';
  process.env.REACT_APP_BLOCKCHAIN_NETWORK = 'sudan-testnet';
  process.env.REACT_APP_BIOMETRIC_SERVICE_URL = 'https://biometric.test.sudan.gov.sd';
  process.env.REACT_APP_ENCRYPTION_KEY = 'test-encryption-key-32-characters';
  
  // Increase test timeout for slower CI environments
  jest.setTimeout(30000);
  
  console.log('✅ Test environment setup complete');
};
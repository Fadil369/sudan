module.exports = async () => {
  // Global teardown for all tests
  console.log('🧹 Tearing down test environment...');

  // Nothing to teardown yet (kept for parity with globalSetup and future CI needs)

  console.log('✅ Test environment teardown complete');
};


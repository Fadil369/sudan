module.exports = async () => {
  // Global teardown for all tests
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up any global state
  if (global.gc) {
    global.gc();
  }
  
  console.log('✅ Test environment cleanup complete');
};
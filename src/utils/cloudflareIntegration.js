/**
 * Cloudflare Integration Testing Utilities
 * Tests connectivity between Pages (frontend) and Workers (backend)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Test Cloudflare Pages deployment
 */
export async function testPagesDeployment() {
  const results = {
    environment: 'unknown',
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isCloudflare: false,
    isLocal: false,
  };

  // Detect environment
  if (results.hostname.includes('pages.dev')) {
    results.environment = 'cloudflare-pages';
    results.isCloudflare = true;
  } else if (results.hostname === 'localhost' || results.hostname === '127.0.0.1') {
    results.environment = 'local-development';
    results.isLocal = true;
  } else {
    results.environment = 'custom-domain';
    results.isCloudflare = true;
  }

  return results;
}

/**
 * Test Worker API connectivity
 */
export async function testWorkerAPI() {
  const results = {
    reachable: false,
    healthy: false,
    responseTime: null,
    error: null,
    details: null,
  };

  const startTime = performance.now();

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    results.responseTime = Math.round(performance.now() - startTime);
    results.reachable = true;

    if (response.ok) {
      const data = await response.json();
      results.healthy = data.status === 'healthy';
      results.details = data;
    } else {
      results.error = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    results.error = error.message;
    results.responseTime = Math.round(performance.now() - startTime);
  }

  return results;
}

/**
 * Test D1 Database connectivity (via Worker)
 */
export async function testD1Connection() {
  const results = {
    available: false,
    operational: false,
    error: null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      results.available = true;
      results.operational = data.checks?.d1 === 'healthy';
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Test KV Namespace connectivity
 */
export async function testKVConnection() {
  const results = {
    available: false,
    operational: false,
    error: null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      results.available = true;
      results.operational = data.checks?.kv_sessions === 'healthy';
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Test R2 Storage connectivity
 */
export async function testR2Connection() {
  const results = {
    available: false,
    operational: false,
    error: null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      results.available = true;
      results.operational = data.checks?.r2_documents === 'healthy';
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Test authentication flow
 */
export async function testAuthFlow(oid, password) {
  const results = {
    success: false,
    token: null,
    error: null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oid, password }),
    });

    if (response.ok) {
      const data = await response.json();
      results.success = true;
      results.token = data.token;
    } else {
      results.error = `HTTP ${response.status}`;
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Run comprehensive integration test
 */
export async function runIntegrationTests() {
  console.log('🧪 Running Cloudflare Integration Tests...\n');

  const results = {
    timestamp: new Date().toISOString(),
    pages: null,
    worker: null,
    d1: null,
    kv: null,
    r2: null,
    overall: 'unknown',
  };

  // Test Pages deployment
  console.log('📄 Testing Pages deployment...');
  results.pages = await testPagesDeployment();
  console.log('✓ Pages:', results.pages);

  // Test Worker API
  console.log('\n⚡ Testing Worker API...');
  results.worker = await testWorkerAPI();
  console.log('✓ Worker:', results.worker);

  // Test D1 Database
  console.log('\n💾 Testing D1 Database...');
  results.d1 = await testD1Connection();
  console.log('✓ D1:', results.d1);

  // Test KV Namespace
  console.log('\n🗄️ Testing KV Namespace...');
  results.kv = await testKVConnection();
  console.log('✓ KV:', results.kv);

  // Test R2 Storage
  console.log('\n📦 Testing R2 Storage...');
  results.r2 = await testR2Connection();
  console.log('✓ R2:', results.r2);

  // Determine overall status
  const allHealthy = 
    results.worker.healthy &&
    results.d1.operational &&
    results.kv.operational &&
    results.r2.operational;

  results.overall = allHealthy ? 'healthy' : 'degraded';

  console.log('\n' + '='.repeat(50));
  console.log(`Overall Status: ${results.overall.toUpperCase()}`);
  console.log('='.repeat(50));

  return results;
}

/**
 * Helper to log integration test results in a readable format
 */
export function logTestResults(results) {
  console.group('Cloudflare Integration Test Results');
  
  console.log('Environment:', results.pages?.environment);
  console.log('Worker Health:', results.worker?.healthy ? '✅' : '❌');
  console.log('Worker Response Time:', `${results.worker?.responseTime}ms`);
  console.log('D1 Database:', results.d1?.operational ? '✅' : '❌');
  console.log('KV Namespace:', results.kv?.operational ? '✅' : '❌');
  console.log('R2 Storage:', results.r2?.operational ? '✅' : '❌');
  console.log('Overall:', results.overall === 'healthy' ? '✅ Healthy' : '⚠️ Degraded');
  
  console.groupEnd();
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.cloudflareTests = {
    testPagesDeployment,
    testWorkerAPI,
    testD1Connection,
    testKVConnection,
    testR2Connection,
    testAuthFlow,
    runIntegrationTests,
    logTestResults,
  };

  console.log('💡 Cloudflare test utilities loaded. Run window.cloudflareTests.runIntegrationTests() to test.');
}

export default {
  testPagesDeployment,
  testWorkerAPI,
  testD1Connection,
  testKVConnection,
  testR2Connection,
  testAuthFlow,
  runIntegrationTests,
  logTestResults,
};

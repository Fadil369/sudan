// Sudan Digital Identity System - Performance Load Testing
// K6 Load Testing Script for Production Performance Validation

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const apiResponseTime = new Trend('api_response_time');
const biometricUploadTime = new Trend('biometric_upload_time');
const blockchainTransactionTime = new Trend('blockchain_transaction_time');
const chatResponseTime = new Trend('chat_response_time');

// Test configuration for different load scenarios
export let options = {
  stages: [
    // Ramp-up phase: gradually increase load
    { duration: '2m', target: 100 },   // 100 users over 2 minutes
    { duration: '5m', target: 500 },   // 500 users over 5 minutes
    { duration: '10m', target: 1000 }, // 1000 users over 10 minutes (peak)
    { duration: '5m', target: 1500 },  // Stress test: 1500 users
    { duration: '2m', target: 0 },     // Ramp-down
  ],
  
  thresholds: {
    // Performance requirements
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],    // Error rate under 5%
    error_rate: ['rate<0.05'],
    api_response_time: ['p(90)<1500'], // 90% of API calls under 1.5s
    biometric_upload_time: ['p(95)<5000'], // Biometric uploads under 5s
    blockchain_transaction_time: ['p(90)<3000'], // Blockchain ops under 3s
    chat_response_time: ['p(95)<1000'], // Chat responses under 1s
  },
  
  // Resource limits
  maxVUs: 2000, // Maximum virtual users
};

// Test data generators
const generateCitizenOid = () => `1.3.6.1.4.1.61026.1.${Math.floor(Math.random() * 1000000)}`;
const generatePhoneNumber = () => `+249${Math.floor(Math.random() * 900000000) + 100000000}`;
const generateEmail = () => `test${Math.floor(Math.random() * 10000)}@test.sudan.gov.sd`;

const testCitizens = [
  {
    oid: '1.3.6.1.4.1.61026.1.123456',
    name: 'Ahmed Mohammed Test',
    nationalId: '199012345678',
    phone: '+249912345678',
    email: 'ahmed.test@sudan.gov.sd'
  },
  {
    oid: '1.3.6.1.4.1.61026.1.654321',
    name: 'Fatima Ali Test',
    nationalId: '198506789012',
    phone: '+249987654321',
    email: 'fatima.test@sudan.gov.sd'
  }
];

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'https://api.sudan.gov.sd/v1';
const PORTAL_URL = __ENV.PORTAL_URL || 'https://sudan-identity.gov.sd';

// Authentication helper
function authenticate() {
  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    username: 'test@sudan.gov.sd',
    password: 'TestPassword123!',
    loginType: 'email'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(loginResponse, {
    'login successful': (resp) => resp.status === 200,
    'auth token received': (resp) => resp.json('token') !== undefined,
  });

  return loginResponse.json('token');
}

// Main test scenario
export default function() {
  const token = authenticate();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Test-Run': 'performance-test'
  };

  // Test scenario selection (weighted distribution)
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Citizen identity operations
    testCitizenIdentityOperations(headers);
  } else if (scenario < 0.5) {
    // 20% - Ministry service access
    testMinistryServiceAccess(headers);
  } else if (scenario < 0.65) {
    // 15% - Biometric operations
    testBiometricOperations(headers);
  } else if (scenario < 0.8) {
    // 15% - Document operations
    testDocumentOperations(headers);
  } else if (scenario < 0.9) {
    // 10% - Chat support
    testChatSupport(headers);
  } else {
    // 10% - Dashboard and analytics
    testDashboardOperations(headers);
  }

  sleep(Math.random() * 3 + 1); // Random sleep 1-4 seconds
}

// Test citizen identity operations
function testCitizenIdentityOperations(headers) {
  const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];
  
  // Get citizen by OID
  const getResponse = http.get(`${BASE_URL}/citizens/oid/${citizen.oid}`, { headers });
  
  const getCheck = check(getResponse, {
    'get citizen successful': (resp) => resp.status === 200,
    'citizen data valid': (resp) => resp.json('oid') === citizen.oid,
  });
  
  apiResponseTime.add(getResponse.timings.duration);
  errorRate.add(!getCheck);

  // Update citizen information (25% chance)
  if (Math.random() < 0.25) {
    const updateData = {
      phone: generatePhoneNumber(),
      email: generateEmail(),
      reason: 'Contact information update'
    };

    const updateResponse = http.put(
      `${BASE_URL}/citizens/oid/${citizen.oid}`,
      JSON.stringify(updateData),
      { headers }
    );

    const updateCheck = check(updateResponse, {
      'update citizen successful': (resp) => resp.status === 200,
    });

    apiResponseTime.add(updateResponse.timings.duration);
    errorRate.add(!updateCheck);
  }

  // Validate identity (10% chance)
  if (Math.random() < 0.1) {
    const validationResponse = http.post(
      `${BASE_URL}/citizens/oid/${citizen.oid}/validate`,
      JSON.stringify({
        nationalId: citizen.nationalId,
        phone: citizen.phone
      }),
      { headers }
    );

    const validationCheck = check(validationResponse, {
      'validation successful': (resp) => resp.status === 200,
    });

    apiResponseTime.add(validationResponse.timings.duration);
    errorRate.add(!validationCheck);
  }
}

// Test ministry service access
function testMinistryServiceAccess(headers) {
  const ministries = ['health', 'education', 'interior', 'finance', 'energy', 'justice'];
  const ministry = ministries[Math.floor(Math.random() * ministries.length)];
  const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];

  // Get ministry records
  const recordsResponse = http.get(
    `${BASE_URL}/ministries/${ministry}/records/${citizen.oid}`,
    { headers }
  );

  const recordsCheck = check(recordsResponse, {
    'ministry records retrieved': (resp) => resp.status === 200 || resp.status === 404,
  });

  apiResponseTime.add(recordsResponse.timings.duration);
  errorRate.add(!recordsCheck);

  // Submit application/request (15% chance)
  if (Math.random() < 0.15) {
    const applicationData = {
      type: 'service_request',
      description: `Test application for ${ministry} services`,
      urgency: Math.random() < 0.1 ? 'high' : 'normal'
    };

    const applicationResponse = http.post(
      `${BASE_URL}/ministries/${ministry}/applications/${citizen.oid}`,
      JSON.stringify(applicationData),
      { headers }
    );

    check(applicationResponse, {
      'application submitted': (resp) => resp.status === 200 || resp.status === 201,
    });

    apiResponseTime.add(applicationResponse.timings.duration);
  }
}

// Test biometric operations
function testBiometricOperations(headers) {
  const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];
  const biometricTypes = ['fingerprint', 'facial', 'iris', 'voice'];
  const biometricType = biometricTypes[Math.floor(Math.random() * biometricTypes.length)];

  // Simulate biometric data (mock binary data)
  const mockBiometricData = 'data:image/jpeg;base64,' + 'A'.repeat(1000); // 1KB mock data

  const uploadResponse = http.post(
    `${BASE_URL}/biometric/${citizen.oid}/upload`,
    JSON.stringify({
      biometricType: biometricType,
      biometricData: mockBiometricData
    }),
    { 
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    }
  );

  const uploadCheck = check(uploadResponse, {
    'biometric upload successful': (resp) => resp.status === 200 || resp.status === 201,
  });

  biometricUploadTime.add(uploadResponse.timings.duration);
  errorRate.add(!uploadCheck);

  // Verify biometric (50% chance after upload)
  if (Math.random() < 0.5) {
    const verifyResponse = http.post(
      `${BASE_URL}/biometric/${citizen.oid}/verify`,
      JSON.stringify({
        biometricType: biometricType,
        biometricData: mockBiometricData
      }),
      { headers }
    );

    check(verifyResponse, {
      'biometric verification completed': (resp) => resp.status === 200,
    });

    apiResponseTime.add(verifyResponse.timings.duration);
  }
}

// Test document operations
function testDocumentOperations(headers) {
  const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];
  
  // Get documents
  const documentsResponse = http.get(`${BASE_URL}/documents/${citizen.oid}`, { headers });
  
  const documentsCheck = check(documentsResponse, {
    'documents retrieved': (resp) => resp.status === 200,
  });

  apiResponseTime.add(documentsResponse.timings.duration);
  errorRate.add(!documentsCheck);

  // Upload document (20% chance)
  if (Math.random() < 0.2) {
    const mockDocument = 'JVBERi0xLjQKJcOgw6DDqsOgc...'; // Mock PDF base64
    
    const uploadResponse = http.post(
      `${BASE_URL}/documents/${citizen.oid}/upload`,
      JSON.stringify({
        documentType: 'identity_card',
        description: 'Updated identity document',
        documentData: mockDocument
      }),
      { headers }
    );

    check(uploadResponse, {
      'document upload successful': (resp) => resp.status === 200 || resp.status === 201,
    });
  }
}

// Test chat support functionality
function testChatSupport(headers) {
  // Initialize chat session
  const chatInitResponse = http.post(
    `${BASE_URL}/chat/sessions`,
    JSON.stringify({
      citizenOid: generateCitizenOid(),
      department: 'general'
    }),
    { headers }
  );

  const chatInitCheck = check(chatInitResponse, {
    'chat session created': (resp) => resp.status === 200 || resp.status === 201,
  });

  chatResponseTime.add(chatInitResponse.timings.duration);
  errorRate.add(!chatInitCheck);

  if (chatInitCheck) {
    const sessionId = chatInitResponse.json('sessionId');
    
    // Send message
    const messageResponse = http.post(
      `${BASE_URL}/chat/sessions/${sessionId}/messages`,
      JSON.stringify({
        message: 'Hello, I need help with my identity renewal',
        type: 'text'
      }),
      { headers }
    );

    check(messageResponse, {
      'chat message sent': (resp) => resp.status === 200 || resp.status === 201,
    });

    chatResponseTime.add(messageResponse.timings.duration);
  }
}

// Test dashboard and analytics operations
function testDashboardOperations(headers) {
  const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];
  
  // Get usage analytics
  const analyticsResponse = http.get(
    `${BASE_URL}/analytics/usage/${citizen.oid}?period=30d`,
    { headers }
  );

  const analyticsCheck = check(analyticsResponse, {
    'analytics retrieved': (resp) => resp.status === 200,
  });

  apiResponseTime.add(analyticsResponse.timings.duration);
  errorRate.add(!analyticsCheck);

  // Get notifications
  const notificationsResponse = http.get(
    `${BASE_URL}/notifications/${citizen.oid}`,
    { headers }
  );

  check(notificationsResponse, {
    'notifications retrieved': (resp) => resp.status === 200,
  });

  // Get system health (admin users only, 5% chance)
  if (Math.random() < 0.05) {
    const healthResponse = http.get(`${BASE_URL}/system/health`, { headers });
    
    check(healthResponse, {
      'system health retrieved': (resp) => resp.status === 200 || resp.status === 403,
    });
  }
}

// Blockchain stress test scenario
export function blockchainStressTest() {
  const token = authenticate();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];

  // Test blockchain operations
  const blockchainOps = [
    'identity_created',
    'service_accessed',
    'data_modified',
    'consent_granted'
  ];

  const operation = blockchainOps[Math.floor(Math.random() * blockchainOps.length)];

  const blockchainResponse = http.post(
    `${BASE_URL}/blockchain/record`,
    JSON.stringify({
      oid: citizen.oid,
      operation: operation,
      data: {
        timestamp: new Date().toISOString(),
        metadata: { testRun: true }
      }
    }),
    { headers }
  );

  const blockchainCheck = check(blockchainResponse, {
    'blockchain transaction recorded': (resp) => resp.status === 200 || resp.status === 201,
  });

  blockchainTransactionTime.add(blockchainResponse.timings.duration);
  errorRate.add(!blockchainCheck);

  sleep(1);
}

// Spike test for sudden traffic increases
export function spikeTest() {
  const token = authenticate();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Rapid-fire requests to simulate traffic spikes
  for (let i = 0; i < 5; i++) {
    const citizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];
    
    const response = http.get(`${BASE_URL}/citizens/oid/${citizen.oid}`, { headers });
    
    check(response, {
      'spike test request successful': (resp) => resp.status === 200,
    });

    if (i < 4) sleep(0.1); // Very short sleep between requests
  }
}

// Test configuration for different scenarios
export const scenarios = {
  // Normal load test
  normal_load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 100 },
      { duration: '10m', target: 100 },
      { duration: '2m', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
  
  // Stress test
  stress_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 200 },
      { duration: '5m', target: 500 },
      { duration: '10m', target: 1000 },
      { duration: '5m', target: 1500 }, // Above normal capacity
      { duration: '2m', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
  
  // Spike test
  spike_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 100 },
      { duration: '30s', target: 2000 }, // Sudden spike
      { duration: '1m', target: 100 },
      { duration: '30s', target: 0 },
    ],
  },
  
  // Blockchain specific test
  blockchain_load: {
    executor: 'ramping-vus',
    exec: 'blockchainStressTest',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
  }
};

// Summary report at the end of test
export function handleSummary(data) {
  console.log('Performance Test Summary:');
  console.log('=======================');
  console.log(`Total requests: ${data.metrics.http_reqs.count}`);
  console.log(`Failed requests: ${data.metrics.http_req_failed.count} (${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%)`);
  console.log(`Average response time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms`);
  console.log(`95th percentile: ${data.metrics['http_req_duration{"p(95)"}'].toFixed(2)}ms`);
  
  return {
    'summary.html': htmlReport(data),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Sudan Identity System - Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        .passed { color: green; }
        .failed { color: red; }
    </style>
</head>
<body>
    <h1>Sudan Digital Identity System - Performance Test Report</h1>
    <h2>Test Results</h2>
    <div class="metric">
        <strong>Total Requests:</strong> ${data.metrics.http_reqs.count}
    </div>
    <div class="metric">
        <strong>Failed Requests:</strong> ${data.metrics.http_req_failed.count} (${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%)
    </div>
    <div class="metric">
        <strong>Average Response Time:</strong> ${data.metrics.http_req_duration.avg.toFixed(2)}ms
    </div>
    <div class="metric">
        <strong>95th Percentile:</strong> ${data.metrics['http_req_duration{"p(95)"}'] ? data.metrics['http_req_duration{"p(95)"}'].toFixed(2) : 'N/A'}ms
    </div>
    <div class="metric">
        <strong>Maximum Response Time:</strong> ${data.metrics.http_req_duration.max.toFixed(2)}ms
    </div>
    <p>Generated on: ${new Date().toISOString()}</p>
</body>
</html>
  `;
}
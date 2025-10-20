/**
 * API Routes Test Script
 * Tests all API endpoints with real HTTP requests
 */

const http = require('http');
const { initializeDatabase } = require('./src/database/init');
const { seedDatabase } = require('./src/database/seed');

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

/**
 * HTTP client for making requests
 */
class HttpClient {
  static async request(method, url, data = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  static async get(url) {
    return this.request('GET', url);
  }

  static async post(url, data) {
    return this.request('POST', url, data);
  }

  static async put(url, data) {
    return this.request('PUT', url, data);
  }

  static async delete(url) {
    return this.request('DELETE', url);
  }
}

/**
 * Test runner for API endpoints
 */
class ApiTestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.testClient = null;
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      this.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
      this.failed++;
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(`${message}: value should not be null/undefined`);
    }
  }

  summary() {
    console.log('\n📊 API Test Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📋 Total: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('🎉 All API tests passed!');
    } else {
      console.log('⚠️ Some API tests failed!');
    }
  }
}

/**
 * Check if server is running
 */
async function checkServerHealth() {
  try {
    const response = await HttpClient.get(`${BASE_URL}/health`);
    return response.statusCode === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for server to be ready
 */
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServerHealth()) {
      return true;
    }
    console.log(`⏳ Waiting for server... (attempt ${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

/**
 * Main test function
 */
async function runApiTests() {
  const runner = new ApiTestRunner();

  console.log('🚀 Starting API Route Tests...\n');

  // Check if server is running
  console.log('🔍 Checking server status...');
  if (!(await waitForServer())) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   npm start');
    process.exit(1);
  }
  console.log('✅ Server is running\n');

  // Test 1: Health check endpoint
  await runner.test('GET /health - Health check', async () => {
    const response = await HttpClient.get(`${BASE_URL}/health`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
  });

  // Test 2: API status endpoint
  await runner.test('GET /api/status - API status', async () => {
    const response = await HttpClient.get(`${API_BASE}/status`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
    runner.assertNotNull(response.data.data.uptime, 'Should have uptime');
  });

  // Test 3: Get all clients
  await runner.test('GET /api/clients - Get all clients', async () => {
    const response = await HttpClient.get(`${API_BASE}/clients`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
    runner.assert(Array.isArray(response.data.data), 'Should return array of clients');
    runner.assertNotNull(response.data.meta, 'Should have pagination metadata');
  });

  // Test 4: Get clients with pagination
  await runner.test('GET /api/clients?page=1&limit=5 - Pagination', async () => {
    const response = await HttpClient.get(`${API_BASE}/clients?page=1&limit=5`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.meta.page, 1, 'Should be on page 1');
    runner.assertEqual(response.data.meta.limit, 5, 'Should have limit 5');
  });

  // Test 5: Search clients
  await runner.test('GET /api/clients?search=john - Search clients', async () => {
    const response = await HttpClient.get(`${API_BASE}/clients?search=john`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assert(Array.isArray(response.data.data), 'Should return array of clients');
  });

  // Test 6: Get client stats
  await runner.test('GET /api/clients/stats - Get client statistics', async () => {
    const response = await HttpClient.get(`${API_BASE}/clients/stats`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
    runner.assertNotNull(response.data.data.total, 'Should have total count');
  });

  // Test 7: Create new client
  await runner.test('POST /api/clients - Create new client', async () => {
    const clientData = {
      name: 'API Test Client',
      email: 'api.test@example.com',
      phone: '(555) 123-4567'
    };

    const response = await HttpClient.post(`${API_BASE}/clients`, clientData);
    runner.assertEqual(response.statusCode, 201, 'Should return 201 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
    runner.assertNotNull(response.data.data.id, 'Should have client ID');
    
    // Store for later tests
    runner.testClient = response.data.data;
  });

  // Test 8: Get client by ID
  await runner.test('GET /api/clients/:id - Get client by ID', async () => {
    if (!runner.testClient) {
      throw new Error('Test client not created');
    }

    const response = await HttpClient.get(`${API_BASE}/clients/${runner.testClient.id}`);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
    runner.assertEqual(response.data.data.id, runner.testClient.id, 'Should return correct client');
  });

  // Test 9: Update client
  await runner.test('PUT /api/clients/:id - Update client', async () => {
    if (!runner.testClient) {
      throw new Error('Test client not created');
    }

    const updateData = {
      name: 'Updated API Test Client',
      phone: '(555) 987-6543'
    };

    const response = await HttpClient.put(`${API_BASE}/clients/${runner.testClient.id}`, updateData);
    runner.assertEqual(response.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(response.data.success, true, 'Should indicate success');
    runner.assertEqual(response.data.data.name, updateData.name, 'Should update name');
  });

  // Test 10: Create client with missing data (should fail)
  await runner.test('POST /api/clients - Missing required fields', async () => {
    const clientData = {
      phone: '(555) 999-8888' // Missing name and email
    };

    const response = await HttpClient.post(`${API_BASE}/clients`, clientData);
    runner.assertEqual(response.statusCode, 400, 'Should return 400 status');
    runner.assertEqual(response.data.success, false, 'Should indicate failure');
  });

  // Test 11: Get non-existent client (should fail)
  await runner.test('GET /api/clients/99999 - Non-existent client', async () => {
    const response = await HttpClient.get(`${API_BASE}/clients/99999`);
    runner.assertEqual(response.statusCode, 404, 'Should return 404 status');
    runner.assertEqual(response.data.success, false, 'Should indicate failure');
  });

  // Test 12: Invalid client ID format (should fail)
  await runner.test('GET /api/clients/invalid - Invalid ID format', async () => {
    const response = await HttpClient.get(`${API_BASE}/clients/invalid`);
    runner.assertEqual(response.statusCode, 400, 'Should return 400 status');
    runner.assertEqual(response.data.success, false, 'Should indicate failure');
  });

  // Test 13: Delete client
  await runner.test('DELETE /api/clients/:id - Delete client', async () => {
    if (!runner.testClient) {
      throw new Error('Test client not created');
    }

    const response = await HttpClient.delete(`${API_BASE}/clients/${runner.testClient.id}`);
    runner.assertEqual(response.statusCode, 204, 'Should return 204 status');
  });

  // Test 14: Try to get deleted client (should fail)
  await runner.test('GET /api/clients/:id - Get deleted client', async () => {
    if (!runner.testClient) {
      throw new Error('Test client not created');
    }

    const response = await HttpClient.get(`${API_BASE}/clients/${runner.testClient.id}`);
    runner.assertEqual(response.statusCode, 404, 'Should return 404 status');
    runner.assertEqual(response.data.success, false, 'Should indicate failure');
  });

  // Test 15: Non-existent API endpoint (should fail)
  await runner.test('GET /api/nonexistent - Non-existent endpoint', async () => {
    const response = await HttpClient.get(`${API_BASE}/nonexistent`);
    runner.assertEqual(response.statusCode, 404, 'Should return 404 status');
    runner.assertEqual(response.data.success, false, 'Should indicate failure');
  });

  runner.summary();
  return runner.failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runApiTests()
    .then((success) => {
      console.log('\nAPI tests completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('API test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runApiTests };
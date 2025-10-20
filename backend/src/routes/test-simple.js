/**
 * Simple API Test Script
 * Tests API endpoints by importing them directly
 */

const express = require('express');
const request = require('supertest');
const { initializeDatabase } = require('./src/database/init');
const apiRoutes = require('./src/routes');

// Create test app
const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

/**
 * Test runner for direct API testing
 */
class SimpleApiTestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
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

  summary() {
    console.log('\n📊 Simple API Test Summary:');
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
 * Main test function using direct app testing
 */
async function runSimpleApiTests() {
  const runner = new SimpleApiTestRunner();

  console.log('🚀 Starting Simple API Tests...\n');

  // Initialize database
  try {
    await initializeDatabase();
    console.log('✅ Database initialized\n');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    return false;
  }

  // Test 1: API health endpoint
  await runner.test('GET /api/health - API health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    if (!response.body.success) {
      throw new Error('Health check should return success: true');
    }
  });

  // Test 2: API status endpoint
  await runner.test('GET /api/status - API status', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200);
    
    if (!response.body.success || !response.body.data) {
      throw new Error('Status should return success and data');
    }
  });

  // Test 3: Get all clients
  await runner.test('GET /api/clients - Get all clients', async () => {
    const response = await request(app)
      .get('/api/clients')
      .expect(200);
    
    if (!response.body.success || !Array.isArray(response.body.data)) {
      throw new Error('Should return success and data array');
    }
  });

  // Test 4: Get clients with pagination
  await runner.test('GET /api/clients?page=1&limit=5 - Pagination', async () => {
    const response = await request(app)
      .get('/api/clients?page=1&limit=5')
      .expect(200);
    
    if (response.body.meta.page !== 1 || response.body.meta.limit !== 5) {
      throw new Error('Pagination parameters not working correctly');
    }
  });

  // Test 5: Get client stats
  await runner.test('GET /api/clients/stats - Client stats', async () => {
    const response = await request(app)
      .get('/api/clients/stats')
      .expect(200);
    
    if (!response.body.success || typeof response.body.data.total !== 'number') {
      throw new Error('Stats should return success and total count');
    }
  });

  // Test 6: Create new client
  await runner.test('POST /api/clients - Create client', async () => {
    const clientData = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '(555) 123-4567'
    };

    const response = await request(app)
      .post('/api/clients')
      .send(clientData)
      .expect(201);
    
    if (!response.body.success || !response.body.data.id) {
      throw new Error('Should create client and return ID');
    }
    
    // Store for cleanup
    runner.testClientId = response.body.data.id;
  });

  // Test 7: Get client by ID
  await runner.test('GET /api/clients/:id - Get client by ID', async () => {
    if (!runner.testClientId) {
      throw new Error('Test client not created');
    }

    const response = await request(app)
      .get(`/api/clients/${runner.testClientId}`)
      .expect(200);
    
    if (!response.body.success || response.body.data.id !== runner.testClientId) {
      throw new Error('Should return correct client');
    }
  });

  // Test 8: Update client
  await runner.test('PUT /api/clients/:id - Update client', async () => {
    if (!runner.testClientId) {
      throw new Error('Test client not created');
    }

    const updateData = { name: 'Updated Test Client' };

    const response = await request(app)
      .put(`/api/clients/${runner.testClientId}`)
      .send(updateData)
      .expect(200);
    
    if (!response.body.success || response.body.data.name !== updateData.name) {
      throw new Error('Should update client name');
    }
  });

  // Test 9: Invalid client ID
  await runner.test('GET /api/clients/invalid - Invalid ID', async () => {
    await request(app)
      .get('/api/clients/invalid')
      .expect(400);
  });

  // Test 10: Non-existent client
  await runner.test('GET /api/clients/99999 - Non-existent client', async () => {
    await request(app)
      .get('/api/clients/99999')
      .expect(404);
  });

  // Test 11: Create client with missing data
  await runner.test('POST /api/clients - Missing data', async () => {
    const incompleteData = { phone: '(555) 999-8888' }; // Missing name and email

    await request(app)
      .post('/api/clients')
      .send(incompleteData)
      .expect(400);
  });

  // Test 12: Delete client
  await runner.test('DELETE /api/clients/:id - Delete client', async () => {
    if (!runner.testClientId) {
      throw new Error('Test client not created');
    }

    await request(app)
      .delete(`/api/clients/${runner.testClientId}`)
      .expect(204);
  });

  // Test 13: Non-existent endpoint
  await runner.test('GET /api/nonexistent - Non-existent endpoint', async () => {
    await request(app)
      .get('/api/nonexistent')
      .expect(404);
  });

  runner.summary();
  return runner.failed === 0;
}

// Check if supertest is available
try {
  require.resolve('supertest');
} catch (error) {
  console.log('ℹ️ supertest not available, installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install --save-dev supertest', { stdio: 'inherit' });
    console.log('✅ supertest installed');
  } catch (installError) {
    console.log('⚠️ Could not install supertest. Running without it...');
    console.log('📌 To run full tests, install supertest: npm install --save-dev supertest');
    process.exit(0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSimpleApiTests()
    .then((success) => {
      console.log('\nSimple API tests completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Simple API test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleApiTests };
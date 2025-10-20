/**
 * Client Controller Test Script
 * Tests all controller functions with mock Express req/res objects
 */

const clientController = require('../controllers/clientController');
const Client = require('../models/Client');
const { initializeDatabase } = require('../database/init');

/**
 * Mock Express request object
 */
function createMockRequest(options = {}) {
  return {
    params: options.params || {},
    query: options.query || {},
    body: options.body || {}
  };
}

/**
 * Mock Express response object
 */
function createMockResponse() {
  const res = {
    statusCode: 200,
    responseData: null,
    headers: {},
    
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    
    json: function(data) {
      this.responseData = data;
      return this;
    },
    
    send: function(data) {
      this.responseData = data;
      return this;
    },
    
    set: function(name, value) {
      this.headers[name] = value;
      return this;
    }
  };
  
  return res;
}

/**
 * Mock Express next function
 */
function createMockNext() {
  const errors = [];
  
  function next(error) {
    if (error) {
      errors.push(error);
    }
  }
  
  next.getErrors = () => errors;
  next.hasErrors = () => errors.length > 0;
  next.getLastError = () => errors[errors.length - 1];
  
  return next;
}

/**
 * Test runner for controller tests
 */
class ControllerTestRunner {
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
    console.log('\n📊 Controller Test Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📋 Total: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('🎉 All controller tests passed!');
    } else {
      console.log('⚠️ Some controller tests failed!');
    }
  }
}

/**
 * Test data
 */
const testClient = {
  name: 'Controller Test User',
  email: 'controller.test@example.com',
  phone: '(555) 999-8888'
};

/**
 * Main test function
 */
async function runControllerTests() {
  const runner = new ControllerTestRunner();

  console.log('🚀 Starting Client Controller Tests...\n');

  // Initialize database and create test client
  try {
    await initializeDatabase();
    const createdClient = await Client.create(testClient);
    testClient.id = createdClient.id;
    console.log('✅ Test setup completed\n');
  } catch (error) {
    console.error('❌ Failed to set up test data:', error.message);
    return;
  }

  // Test 1: getAllClients with default parameters
  await runner.test('getAllClients - default parameters', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getAllClients(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    runner.assertNotNull(res.responseData, 'Should have response data');
    runner.assertEqual(res.responseData.success, true, 'Should indicate success');
    runner.assert(Array.isArray(res.responseData.data), 'Should return array of clients');
    runner.assertNotNull(res.responseData.meta, 'Should have pagination metadata');
  });

  // Test 2: getAllClients with pagination
  await runner.test('getAllClients - with pagination', async () => {
    const req = createMockRequest({
      query: { page: '2', limit: '5', sortBy: 'name', order: 'asc' }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getAllClients(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(res.responseData.meta.page, 2, 'Should be on page 2');
    runner.assertEqual(res.responseData.meta.limit, 5, 'Should have limit 5');
  });

  // Test 3: getAllClients with search
  await runner.test('getAllClients - with search', async () => {
    const req = createMockRequest({
      query: { search: 'Controller Test' }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getAllClients(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    const found = res.responseData.data.some(c => c.name.includes('Controller Test'));
    runner.assert(found, 'Should find test client in search results');
  });

  // Test 4: getClientById - valid ID
  await runner.test('getClientById - valid ID', async () => {
    const req = createMockRequest({
      params: { id: testClient.id.toString() }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getClientById(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(res.responseData.success, true, 'Should indicate success');
    runner.assertEqual(res.responseData.data.id, testClient.id, 'Should return correct client');
  });

  // Test 5: getClientById - invalid ID
  await runner.test('getClientById - invalid ID', async () => {
    const req = createMockRequest({
      params: { id: 'invalid' }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getClientById(req, res, next);

    runner.assert(next.hasErrors(), 'Should have validation error');
    const error = next.getLastError();
    runner.assertEqual(error.status, 400, 'Should return 400 status');
    runner.assertEqual(error.code, 'VALIDATION_ERROR', 'Should be validation error');
  });

  // Test 6: getClientById - non-existent ID
  await runner.test('getClientById - non-existent ID', async () => {
    const req = createMockRequest({
      params: { id: '99999' }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getClientById(req, res, next);

    runner.assert(next.hasErrors(), 'Should have not found error');
    const error = next.getLastError();
    runner.assertEqual(error.status, 404, 'Should return 404 status');
    runner.assertEqual(error.code, 'NOT_FOUND', 'Should be not found error');
  });

  // Test 7: createClient - valid data
  await runner.test('createClient - valid data', async () => {
    const req = createMockRequest({
      body: {
        name: 'New Test Client',
        email: 'new.test@example.com',
        phone: '(555) 111-2222'
      }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.createClient(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 201, 'Should return 201 status');
    runner.assertEqual(res.responseData.success, true, 'Should indicate success');
    runner.assertNotNull(res.responseData.data.id, 'Should have new client ID');
    
    // Clean up - delete the created client
    await Client.delete(res.responseData.data.id);
  });

  // Test 8: createClient - missing required fields
  await runner.test('createClient - missing required fields', async () => {
    const req = createMockRequest({
      body: { phone: '(555) 111-2222' } // Missing name and email
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.createClient(req, res, next);

    runner.assert(next.hasErrors(), 'Should have validation error');
    const error = next.getLastError();
    runner.assertEqual(error.status, 400, 'Should return 400 status');
    runner.assertEqual(error.code, 'VALIDATION_ERROR', 'Should be validation error');
  });

  // Test 9: createClient - duplicate email
  await runner.test('createClient - duplicate email', async () => {
    const req = createMockRequest({
      body: {
        name: 'Duplicate Email Test',
        email: testClient.email, // Use existing email
        phone: '(555) 333-4444'
      }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.createClient(req, res, next);

    runner.assert(next.hasErrors(), 'Should have duplicate email error');
    const error = next.getLastError();
    runner.assertEqual(error.status, 409, 'Should return 409 status');
    runner.assertEqual(error.code, 'DUPLICATE_EMAIL', 'Should be duplicate email error');
  });

  // Test 10: updateClient - valid data
  await runner.test('updateClient - valid data', async () => {
    const req = createMockRequest({
      params: { id: testClient.id.toString() },
      body: {
        name: 'Updated Controller Test User',
        phone: '(555) 999-7777'
      }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.updateClient(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(res.responseData.success, true, 'Should indicate success');
    runner.assertEqual(res.responseData.data.name, 'Updated Controller Test User', 'Should update name');
  });

  // Test 11: updateClient - non-existent ID
  await runner.test('updateClient - non-existent ID', async () => {
    const req = createMockRequest({
      params: { id: '99999' },
      body: { name: 'Does not exist' }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.updateClient(req, res, next);

    runner.assert(next.hasErrors(), 'Should have not found error');
    const error = next.getLastError();
    runner.assertEqual(error.status, 404, 'Should return 404 status');
    runner.assertEqual(error.code, 'NOT_FOUND', 'Should be not found error');
  });

  // Test 12: getClientStats
  await runner.test('getClientStats', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.getClientStats(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    runner.assertEqual(res.responseData.success, true, 'Should indicate success');
    runner.assertNotNull(res.responseData.data.total, 'Should have total count');
  });

  // Test 13: deleteClient - valid ID
  await runner.test('deleteClient - valid ID', async () => {
    const req = createMockRequest({
      params: { id: testClient.id.toString() }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.deleteClient(req, res, next);

    runner.assert(!next.hasErrors(), 'Should not have errors');
    runner.assertEqual(res.statusCode, 204, 'Should return 204 status');
  });

  // Test 14: deleteClient - non-existent ID (after deletion)
  await runner.test('deleteClient - non-existent ID', async () => {
    const req = createMockRequest({
      params: { id: testClient.id.toString() }
    });
    const res = createMockResponse();
    const next = createMockNext();

    await clientController.deleteClient(req, res, next);

    runner.assert(next.hasErrors(), 'Should have not found error');
    const error = next.getLastError();
    runner.assertEqual(error.status, 404, 'Should return 404 status');
    runner.assertEqual(error.code, 'NOT_FOUND', 'Should be not found error');
  });

  runner.summary();
  return runner.failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runControllerTests()
    .then((success) => {
      console.log('\nController tests completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Controller test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runControllerTests };
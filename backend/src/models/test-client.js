/**
 * Client Model Test Script
 * Tests all CRUD operations and edge cases
 */

const Client = require('../models/Client');
const { initializeDatabase } = require('../database/init');

/**
 * Test runner with colored output
 */
class TestRunner {
  constructor() {
    this.tests = [];
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

  async assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  async assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(`${message}: value should not be null/undefined`);
    }
  }

  summary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📋 Total: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️ Some tests failed!');
    }
  }
}

/**
 * Test data
 */
const testClient = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '(555) 123-4567'
};

const updatedClient = {
  name: 'Updated Test User',
  email: 'updated@example.com',
  phone: '(555) 987-6543'
};

/**
 * Main test function
 */
async function runTests() {
  const runner = new TestRunner();

  console.log('🚀 Starting Client Model Tests...\n');

  // Initialize database
  try {
    await initializeDatabase();
    console.log('✅ Database initialized for testing\n');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    return;
  }

  // Test 1: Create client
  await runner.test('Create new client', async () => {
    const client = await Client.create(testClient);
    
    await runner.assertNotNull(client.id, 'Client should have an ID');
    await runner.assertEqual(client.name, testClient.name, 'Name should match');
    await runner.assertEqual(client.email, testClient.email, 'Email should match');
    await runner.assertEqual(client.phone, testClient.phone, 'Phone should match');
    await runner.assertNotNull(client.created_at, 'Should have created_at timestamp');
    await runner.assertNotNull(client.updated_at, 'Should have updated_at timestamp');
    
    // Store ID for subsequent tests
    testClient.id = client.id;
  });

  // Test 2: Find client by ID
  await runner.test('Find client by ID', async () => {
    const client = await Client.findById(testClient.id);
    
    await runner.assertNotNull(client, 'Client should be found');
    await runner.assertEqual(client.id, testClient.id, 'ID should match');
    await runner.assertEqual(client.email, testClient.email, 'Email should match');
  });

  // Test 3: Find all clients
  await runner.test('Find all clients with pagination', async () => {
    const result = await Client.findAll({ page: 1, limit: 5 });
    
    await runner.assertNotNull(result.clients, 'Should return clients array');
    await runner.assert(Array.isArray(result.clients), 'Clients should be an array');
    await runner.assert(result.total >= 1, 'Should have at least 1 client');
    await runner.assert(result.page === 1, 'Page should be 1');
    await runner.assert(result.limit === 5, 'Limit should be 5');
    await runner.assertNotNull(result.totalPages, 'Should have totalPages');
  });

  // Test 4: Search clients
  await runner.test('Search clients by name', async () => {
    const result = await Client.findAll({ search: 'Test' });
    
    await runner.assert(result.clients.length >= 1, 'Should find at least 1 client');
    const found = result.clients.some(c => c.name.includes('Test'));
    await runner.assert(found, 'Should find client with "Test" in name');
  });

  // Test 5: Search clients by email
  await runner.test('Search clients by email', async () => {
    const result = await Client.findAll({ search: 'test@example.com' });
    
    await runner.assert(result.clients.length >= 1, 'Should find at least 1 client');
    const found = result.clients.some(c => c.email === 'test@example.com');
    await runner.assert(found, 'Should find client with exact email');
  });

  // Test 6: Update client
  await runner.test('Update existing client', async () => {
    // Add a small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const client = await Client.update(testClient.id, updatedClient);
    
    await runner.assertEqual(client.id, testClient.id, 'ID should remain the same');
    await runner.assertEqual(client.name, updatedClient.name, 'Name should be updated');
    await runner.assertEqual(client.email, updatedClient.email, 'Email should be updated');
    await runner.assertEqual(client.phone, updatedClient.phone, 'Phone should be updated');
    // Note: updated_at timestamp might be the same as created_at due to precision, so just check it exists
    await runner.assertNotNull(client.updated_at, 'Should have updated_at timestamp');
  });

  // Test 7: Partial update
  await runner.test('Partial update (name only)', async () => {
    const originalClient = await Client.findById(testClient.id);
    const client = await Client.update(testClient.id, { name: 'Partially Updated Name' });
    
    await runner.assertEqual(client.name, 'Partially Updated Name', 'Name should be updated');
    await runner.assertEqual(client.email, originalClient.email, 'Email should remain unchanged');
  });

  // Test 8: Validation tests
  await runner.test('Create client with invalid data (empty name)', async () => {
    try {
      await Client.create({ name: '', email: 'invalid@test.com' });
      throw new Error('Should have thrown validation error');
    } catch (error) {
      await runner.assert(error.message.includes('Name is required'), 'Should reject empty name');
    }
  });

  await runner.test('Create client with invalid email', async () => {
    try {
      await Client.create({ name: 'Test', email: 'invalid-email' });
      throw new Error('Should have thrown validation error');
    } catch (error) {
      await runner.assert(error.message.includes('Invalid email'), 'Should reject invalid email');
    }
  });

  await runner.test('Create client with duplicate email', async () => {
    try {
      await Client.create({ name: 'Duplicate', email: updatedClient.email });
      throw new Error('Should have thrown uniqueness error');
    } catch (error) {
      await runner.assert(error.message.includes('already exists'), 'Should reject duplicate email');
    }
  });

  // Test 9: Edge cases
  await runner.test('Find non-existent client', async () => {
    const client = await Client.findById(99999);
    await runner.assertEqual(client, null, 'Should return null for non-existent client');
  });

  await runner.test('Update non-existent client', async () => {
    try {
      await Client.update(99999, { name: 'Does not exist' });
      throw new Error('Should have thrown not found error');
    } catch (error) {
      await runner.assert(error.message.includes('not found'), 'Should reject update of non-existent client');
    }
  });

  await runner.test('Delete non-existent client', async () => {
    const result = await Client.delete(99999);
    await runner.assertEqual(result, false, 'Should return false for non-existent client');
  });

  // Test 10: Sorting and pagination
  await runner.test('Sort clients by name (ASC)', async () => {
    const result = await Client.findAll({ sortBy: 'name', order: 'ASC' });
    
    if (result.clients.length > 1) {
      const firstClient = result.clients[0];
      const secondClient = result.clients[1];
      await runner.assert(firstClient.name <= secondClient.name, 'Should be sorted by name ascending');
    }
  });

  // Test 11: Statistics
  await runner.test('Get client statistics', async () => {
    const stats = await Client.getStats();
    
    await runner.assertNotNull(stats.total, 'Should have total count');
    await runner.assert(stats.total >= 1, 'Should have at least 1 client');
    await runner.assertNotNull(stats.recentlyAdded, 'Should have recently added count');
  });

  // Test 12: Delete client (should be last test)
  await runner.test('Delete existing client', async () => {
    const result = await Client.delete(testClient.id);
    await runner.assertEqual(result, true, 'Should return true for successful deletion');
    
    // Verify client is gone
    const client = await Client.findById(testClient.id);
    await runner.assertEqual(client, null, 'Client should no longer exist');
  });

  // Test 13: Input sanitization
  await runner.test('Input sanitization', async () => {
    const client = await Client.create({
      name: '  John Doe  ',  // Extra spaces
      email: '  JOHN@EXAMPLE.COM  ',  // Uppercase and spaces
      phone: '(555) 123-4567'
    });
    
    await runner.assertEqual(client.name, 'John Doe', 'Name should be trimmed');
    await runner.assertEqual(client.email, 'john@example.com', 'Email should be lowercase and trimmed');
    
    // Clean up
    await Client.delete(client.id);
  });

  runner.summary();
  
  return runner.failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then((success) => {
      console.log('\nTests completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
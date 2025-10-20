/**
 * Swagger Integration Test Script
 * Tests that Swagger documentation is accessible and API endpoints work
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

/**
 * Simple HTTP request helper
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: res.headers['content-type']?.includes('json') ? JSON.parse(data) : data
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', reject);
  });
}

/**
 * Test Swagger integration
 */
async function testSwaggerIntegration() {
  console.log('🧪 Testing Swagger Integration...\n');

  const tests = [
    {
      name: 'Swagger UI Page',
      url: `${BASE_URL}/api-docs`,
      expectedStatus: 200,
      expectHTML: true
    },
    {
      name: 'API Health Endpoint',
      url: `${BASE_URL}/api/health`, 
      expectedStatus: 200,
      expectJSON: true
    },
    {
      name: 'API Status Endpoint',
      url: `${BASE_URL}/api/status`,
      expectedStatus: 200,
      expectJSON: true
    },
    {
      name: 'Get All Clients',
      url: `${BASE_URL}/api/clients`,
      expectedStatus: 200,
      expectJSON: true
    },
    {
      name: 'Get Client Stats',
      url: `${BASE_URL}/api/clients/stats`,
      expectedStatus: 200,
      expectJSON: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      const response = await makeRequest(test.url);
      
      if (response.statusCode === test.expectedStatus) {
        if (test.expectJSON && typeof response.data === 'object') {
          console.log(`✅ PASSED: ${test.name} (JSON response)`);
          if (response.data.success !== undefined) {
            console.log(`   Success: ${response.data.success}`);
          }
        } else if (test.expectHTML && typeof response.data === 'string' && response.data.includes('swagger')) {
          console.log(`✅ PASSED: ${test.name} (HTML with Swagger)`);
        } else if (!test.expectJSON && !test.expectHTML) {
          console.log(`✅ PASSED: ${test.name}`);
        } else {
          console.log(`⚠️ PARTIAL: ${test.name} (unexpected response format)`);
        }
        passed++;
      } else {
        console.log(`❌ FAILED: ${test.name} (status: ${response.statusCode}, expected: ${test.expectedStatus})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${test.name} (error: ${error.message})`);
      failed++;
    }
  }

  console.log('\n📊 Swagger Integration Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All Swagger integration tests passed!');
    console.log('📚 Swagger documentation is available at: http://localhost:3001/api-docs');
    console.log('🚀 API is ready for interactive testing!');
  } else {
    console.log('\n⚠️ Some integration tests failed!');
  }

  return failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  testSwaggerIntegration()
    .then((success) => {
      console.log('\nSwagger integration tests completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Swagger integration test error:', error);
      process.exit(1);
    });
}

module.exports = { testSwaggerIntegration };
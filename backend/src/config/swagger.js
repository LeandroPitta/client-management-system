/**
 * Swagger/OpenAPI Configuration
 * Configures interactive API documentation
 */

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Management System API',
      version: '1.0.0',
      description: `
        A comprehensive RESTful API for managing client data with full CRUD operations.
        
        ## Features
        - Complete client management (Create, Read, Update, Delete)
        - Advanced search and filtering capabilities
        - Pagination support for large datasets
        - Comprehensive input validation
        - Detailed error handling
        - Client statistics and analytics
        
        ## Authentication
        Currently, all endpoints are publicly accessible (no authentication required).
        
        ## Rate Limiting
        No rate limiting is currently implemented.
      `,
      contact: {
        name: 'API Support',
        email: 'support@clientmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health and status endpoints'
      },
      {
        name: 'Clients',
        description: 'Client management operations'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
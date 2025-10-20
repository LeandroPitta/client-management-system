/**
 * API Routes Index
 * Central point for organizing all API routes
 */

const express = require('express');
const clientRoutes = require('./clientRoutes');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *           example: 1
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Client's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Client's email address (must be unique)
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           minLength: 10
 *           maxLength: 20
 *           description: Client's phone number (optional)
 *           example: "(555) 123-4567"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *           example: "2025-10-19T12:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 *           example: "2025-10-19T12:00:00.000Z"
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           description: Response data
 *         meta:
 *           type: object
 *           description: Additional metadata (pagination, etc.)
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "VALIDATION_ERROR"
 *             message:
 *               type: string
 *               example: "Invalid input data"
 *             details:
 *               type: object
 *               description: Additional error details
 *     
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 25
 *         totalPages:
 *           type: integer
 *           example: 3
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API Health Check
 *     description: Check if the API is running and responsive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: "Client Management System API is running"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Client Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: API Status Information
 *     description: Get detailed status information about the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API status information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         service:
 *                           type: string
 *                           example: "Client Management System API"
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         status:
 *                           type: string
 *                           example: "operational"
 *                         uptime:
 *                           type: number
 *                           example: 123.456
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         environment:
 *                           type: string
 *                           example: "development"
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'Client Management System API',
      version: '1.0.0',
      status: 'operational',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Mount client routes
router.use('/clients', clientRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      suggestion: 'Check the API documentation for available endpoints'
    }
  });
});

module.exports = router;
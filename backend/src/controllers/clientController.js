const Client = require('../models/Client');

/**
 * Client Controller
 * Handles HTTP requests for client management API endpoints
 * Connects HTTP layer to the Client model
 */

/**
 * Get all clients with optional filtering, pagination, and sorting
 * GET /api/clients
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search term for name or email
 * - sortBy: Field to sort by (default: 'created_at')
 * - order: Sort order 'asc' or 'desc' (default: 'desc')
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllClients = async (req, res, next) => {
  try {
    // Extract and validate query parameters
    const options = extractQueryOptions(req.query);
    
    // Log request for debugging
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - GET /api/clients - Query:`, options);

    // Call model method
    const result = await Client.findAll(options);

    // Return standardized success response
    res.status(200).json({
      success: true,
      data: result.clients,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      },
      message: `Retrieved ${result.clients.length} clients`
    });

  } catch (error) {
    console.error('❌ Error in getAllClients:', error.message);
    next(createError(500, 'INTERNAL_ERROR', 'Failed to retrieve clients', error.message));
  }
};

/**
 * Get a single client by ID
 * GET /api/clients/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getClientById = async (req, res, next) => {
  try {
    // Extract and validate ID parameter
    const { id } = req.params;
    const clientId = validateIdParameter(id);

    // Log request for debugging
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - GET /api/clients/${id}`);

    // Call model method
    const client = await Client.findById(clientId);

    if (!client) {
      return next(createError(404, 'NOT_FOUND', 'Client not found', `No client found with ID ${clientId}`));
    }

    // Return standardized success response
    res.status(200).json({
      success: true,
      data: client,
      message: 'Client retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error in getClientById:', error.message);
    
    if (error.message.includes('Invalid ID')) {
      return next(createError(400, 'VALIDATION_ERROR', 'Invalid client ID', error.message));
    }
    
    next(createError(500, 'INTERNAL_ERROR', 'Failed to retrieve client', error.message));
  }
};

/**
 * Create a new client
 * POST /api/clients
 * 
 * Request Body:
 * - name: Client name (required)
 * - email: Client email (required, unique)
 * - phone: Client phone (optional)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createClient = async (req, res, next) => {
  try {
    // Extract client data from request body
    const clientData = extractClientData(req.body);

    // Log request for debugging (excluding sensitive data)
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - POST /api/clients - Data:`, {
      name: clientData.name,
      email: clientData.email,
      hasPhone: !!clientData.phone
    });

    // Validate required fields
    validateRequiredFields(clientData, ['name', 'email']);

    // Call model method to create client
    const createdClient = await Client.create(clientData);

    // Return standardized success response with 201 status
    res.status(201).json({
      success: true,
      data: createdClient,
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('❌ Error in createClient:', error.message);
    
    // Handle validation errors
    if (error.message.includes('required') || 
        error.message.includes('Invalid') ||
        error.message.includes('must be')) {
      return next(createError(400, 'VALIDATION_ERROR', 'Invalid input data', error.message));
    }
    
    // Handle duplicate email
    if (error.message.includes('already exists')) {
      return next(createError(409, 'DUPLICATE_EMAIL', 'Email already exists', error.message));
    }
    
    next(createError(500, 'INTERNAL_ERROR', 'Failed to create client', error.message));
  }
};

/**
 * Update an existing client
 * PUT /api/clients/:id
 * 
 * Request Body:
 * - name: Client name (optional)
 * - email: Client email (optional, unique)
 * - phone: Client phone (optional)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateClient = async (req, res, next) => {
  try {
    // Extract and validate ID parameter
    const { id } = req.params;
    const clientId = validateIdParameter(id);

    // Extract client data from request body
    const clientData = extractClientData(req.body);

    // Log request for debugging
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - PUT /api/clients/${id} - Data:`, {
      name: clientData.name,
      email: clientData.email,
      hasPhone: !!clientData.phone
    });

    // Call model method to update client
    const updatedClient = await Client.update(clientId, clientData);

    // Return standardized success response
    res.status(200).json({
      success: true,
      data: updatedClient,
      message: 'Client updated successfully'
    });

  } catch (error) {
    console.error('❌ Error in updateClient:', error.message);
    
    // Handle validation errors
    if (error.message.includes('Invalid ID')) {
      return next(createError(400, 'VALIDATION_ERROR', 'Invalid client ID', error.message));
    }
    
    // Handle not found
    if (error.message.includes('not found')) {
      return next(createError(404, 'NOT_FOUND', 'Client not found', error.message));
    }
    
    // Handle validation errors
    if (error.message.includes('Invalid') || error.message.includes('must be')) {
      return next(createError(400, 'VALIDATION_ERROR', 'Invalid input data', error.message));
    }
    
    // Handle duplicate email
    if (error.message.includes('already exists')) {
      return next(createError(409, 'DUPLICATE_EMAIL', 'Email already exists', error.message));
    }
    
    next(createError(500, 'INTERNAL_ERROR', 'Failed to update client', error.message));
  }
};

/**
 * Delete a client by ID
 * DELETE /api/clients/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteClient = async (req, res, next) => {
  try {
    // Extract and validate ID parameter
    const { id } = req.params;
    const clientId = validateIdParameter(id);

    // Log request for debugging
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - DELETE /api/clients/${id}`);

    // Call model method to delete client
    const deleted = await Client.delete(clientId);

    if (!deleted) {
      return next(createError(404, 'NOT_FOUND', 'Client not found', `No client found with ID ${clientId}`));
    }

    // Return 204 No Content for successful deletion
    res.status(204).send();

  } catch (error) {
    console.error('❌ Error in deleteClient:', error.message);
    
    if (error.message.includes('Invalid ID')) {
      return next(createError(400, 'VALIDATION_ERROR', 'Invalid client ID', error.message));
    }
    
    next(createError(500, 'INTERNAL_ERROR', 'Failed to delete client', error.message));
  }
};

/**
 * Get client statistics
 * GET /api/clients/stats
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getClientStats = async (req, res, next) => {
  try {
    // Log request for debugging
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - GET /api/clients/stats`);

    // Call model method
    const stats = await Client.getStats();

    // Return standardized success response
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Client statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error in getClientStats:', error.message);
    next(createError(500, 'INTERNAL_ERROR', 'Failed to retrieve statistics', error.message));
  }
};

// ===================
// HELPER FUNCTIONS
// ===================

/**
 * Extract and validate query options from request query parameters
 * @param {Object} query - Request query parameters
 * @returns {Object} Validated query options
 */
function extractQueryOptions(query) {
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
    search: (query.search || '').trim(),
    sortBy: query.sortBy || 'created_at',
    order: (query.order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC'
  };
}

/**
 * Extract client data from request body
 * @param {Object} body - Request body
 * @returns {Object} Extracted client data
 */
function extractClientData(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const clientData = {};
  
  if (body.name !== undefined) {
    clientData.name = body.name;
  }
  
  if (body.email !== undefined) {
    clientData.email = body.email;
  }
  
  if (body.phone !== undefined) {
    clientData.phone = body.phone;
  }

  return clientData;
}

/**
 * Validate required fields in client data
 * @param {Object} data - Client data object
 * @param {Array<string>} requiredFields - Array of required field names
 */
function validateRequiredFields(data, requiredFields) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Validate ID parameter
 * @param {string} id - ID parameter from request
 * @returns {number} Validated ID
 */
function validateIdParameter(id) {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid ID: must be a positive integer');
  }
  return numId;
}

/**
 * Create standardized error object
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - User-friendly error message
 * @param {string} details - Detailed error information
 * @returns {Object} Error object
 */
function createError(status, code, message, details = null) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

// Export controller functions
module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
};
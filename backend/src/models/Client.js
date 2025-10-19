const dbConnection = require('../database/connection');

/**
 * Client Model
 * Data access layer for client management operations
 * Provides CRUD operations with validation and error handling
 */
class Client {
  
  /**
   * Find all clients with optional filtering, pagination, and sorting
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10, max: 100)
   * @param {string} options.search - Search term for name or email
   * @param {string} options.sortBy - Field to sort by (default: 'created_at')
   * @param {string} options.order - Sort order 'ASC' or 'DESC' (default: 'DESC')
   * @returns {Promise<Object>} Object containing clients array, total count, and pagination info
   */
  static async findAll(options = {}) {
    try {
      // Set defaults and validate options
      const page = Math.max(1, parseInt(options.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
      const search = (options.search || '').trim();
      const sortBy = this._validateSortField(options.sortBy || 'created_at');
      const order = (options.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const offset = (page - 1) * limit;

      // Build WHERE clause for search
      let whereClause = '';
      let searchParams = [];
      
      if (search) {
        whereClause = 'WHERE (name LIKE ? OR email LIKE ?)';
        const searchPattern = `%${search}%`;
        searchParams = [searchPattern, searchPattern];
      }

      // Count total records for pagination
      const countSql = `SELECT COUNT(*) as total FROM clients ${whereClause}`;
      const totalResult = await dbConnection.get(countSql, searchParams);
      const total = totalResult.total;

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Get clients with pagination and sorting
      const clientsSql = `
        SELECT * FROM clients 
        ${whereClause}
        ORDER BY ${sortBy} ${order}
        LIMIT ? OFFSET ?
      `;
      
      const clients = await dbConnection.all(clientsSql, [...searchParams, limit, offset]);

      return {
        clients: clients,
        total: total,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasNext: hasNext,
        hasPrev: hasPrev
      };

    } catch (error) {
      console.error('❌ Error in Client.findAll:', error.message);
      throw new Error(`Failed to retrieve clients: ${error.message}`);
    }
  }

  /**
   * Find a single client by ID
   * @param {number} id - Client ID
   * @returns {Promise<Object|null>} Client object or null if not found
   */
  static async findById(id) {
    try {
      // Validate ID
      const clientId = this._validateId(id);
      
      const sql = 'SELECT * FROM clients WHERE id = ?';
      const client = await dbConnection.get(sql, [clientId]);
      
      return client || null;

    } catch (error) {
      if (error.message.includes('Invalid ID')) {
        return null;
      }
      console.error('❌ Error in Client.findById:', error.message);
      throw new Error(`Failed to retrieve client: ${error.message}`);
    }
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client data object
   * @param {string} clientData.name - Client name (required)
   * @param {string} clientData.email - Client email (required, unique)
   * @param {string} clientData.phone - Client phone (optional)
   * @returns {Promise<Object>} Created client object with ID
   */
  static async create(clientData) {
    try {
      // Validate required fields
      const validatedData = this._validateClientData(clientData, true);
      
      // Check email uniqueness
      await this._checkEmailUniqueness(validatedData.email);

      // Insert client
      const sql = `
        INSERT INTO clients (name, email, phone) 
        VALUES (?, ?, ?)
      `;
      
      const result = await dbConnection.run(sql, [
        validatedData.name,
        validatedData.email,
        validatedData.phone
      ]);

      // Fetch and return the created client
      const createdClient = await this.findById(result.lastID);
      if (!createdClient) {
        throw new Error('Failed to retrieve created client');
      }

      return createdClient;

    } catch (error) {
      console.error('❌ Error in Client.create:', error.message);
      
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email address already exists');
      }
      
      throw new Error(`Failed to create client: ${error.message}`);
    }
  }

  /**
   * Update an existing client
   * @param {number} id - Client ID
   * @param {Object} clientData - Updated client data
   * @param {string} clientData.name - Client name
   * @param {string} clientData.email - Client email
   * @param {string} clientData.phone - Client phone
   * @returns {Promise<Object>} Updated client object
   */
  static async update(id, clientData) {
    try {
      // Validate ID
      const clientId = this._validateId(id);
      
      // Check if client exists
      const existingClient = await this.findById(clientId);
      if (!existingClient) {
        throw new Error('Client not found');
      }

      // Validate client data
      const validatedData = this._validateClientData(clientData, false);

      // Check email uniqueness (excluding current client)
      if (validatedData.email && validatedData.email !== existingClient.email) {
        await this._checkEmailUniqueness(validatedData.email, clientId);
      }

      // Build update query dynamically based on provided fields
      const updateFields = [];
      const updateValues = [];

      if (validatedData.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(validatedData.name);
      }
      
      if (validatedData.email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(validatedData.email);
      }
      
      if (validatedData.phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(validatedData.phone);
      }

      if (updateFields.length === 0) {
        // No fields to update, return existing client
        return existingClient;
      }

      // Add updated_at timestamp (will be handled by trigger, but we can be explicit)
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(clientId);

      const sql = `UPDATE clients SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await dbConnection.run(sql, updateValues);

      // Fetch and return updated client
      const updatedClient = await this.findById(clientId);
      return updatedClient;

    } catch (error) {
      console.error('❌ Error in Client.update:', error.message);
      
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email address already exists');
      }
      
      throw new Error(`Failed to update client: ${error.message}`);
    }
  }

  /**
   * Delete a client by ID
   * @param {number} id - Client ID
   * @returns {Promise<boolean>} True if client was deleted, false if not found
   */
  static async delete(id) {
    try {
      // Validate ID
      const clientId = this._validateId(id);
      
      // Check if client exists
      const existingClient = await this.findById(clientId);
      if (!existingClient) {
        return false;
      }

      // Delete client
      const sql = 'DELETE FROM clients WHERE id = ?';
      const result = await dbConnection.run(sql, [clientId]);

      // Return true if a row was affected
      return result.changes > 0;

    } catch (error) {
      console.error('❌ Error in Client.delete:', error.message);
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  /**
   * Get client statistics
   * @returns {Promise<Object>} Statistics object
   */
  static async getStats() {
    try {
      const totalClients = await dbConnection.get('SELECT COUNT(*) as count FROM clients');
      const recentClients = await dbConnection.get(`
        SELECT COUNT(*) as count FROM clients 
        WHERE created_at >= datetime('now', '-7 days')
      `);
      const oldestClient = await dbConnection.get(`
        SELECT created_at FROM clients 
        ORDER BY created_at ASC LIMIT 1
      `);
      const newestClient = await dbConnection.get(`
        SELECT created_at FROM clients 
        ORDER BY created_at DESC LIMIT 1
      `);

      return {
        total: totalClients.count,
        recentlyAdded: recentClients.count,
        oldestCreated: oldestClient?.created_at || null,
        newestCreated: newestClient?.created_at || null
      };

    } catch (error) {
      console.error('❌ Error in Client.getStats:', error.message);
      throw new Error(`Failed to retrieve statistics: ${error.message}`);
    }
  }

  // ===================
  // PRIVATE HELPER METHODS
  // ===================

  /**
   * Validate client ID
   * @private
   * @param {*} id - ID to validate
   * @returns {number} Validated ID
   */
  static _validateId(id) {
    const numId = parseInt(id);
    if (isNaN(numId) || numId <= 0) {
      throw new Error('Invalid ID: must be a positive integer');
    }
    return numId;
  }

  /**
   * Validate sort field
   * @private
   * @param {string} field - Field to validate
   * @returns {string} Validated field
   */
  static _validateSortField(field) {
    const allowedFields = ['id', 'name', 'email', 'phone', 'created_at', 'updated_at'];
    if (!allowedFields.includes(field)) {
      return 'created_at'; // Default fallback
    }
    return field;
  }

  /**
   * Validate and sanitize client data
   * @private
   * @param {Object} data - Client data to validate
   * @param {boolean} requireAll - Whether all fields are required
   * @returns {Object} Validated and sanitized data
   */
  static _validateClientData(data, requireAll = false) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid client data: must be an object');
    }

    const validated = {};

    // Validate name
    if (data.name !== undefined) {
      const name = (data.name || '').toString().trim();
      if (requireAll && !name) {
        throw new Error('Name is required');
      }
      if (name && (name.length < 1 || name.length > 100)) {
        throw new Error('Name must be between 1 and 100 characters');
      }
      if (name && !/^[a-zA-Z\s\-'\.]+$/.test(name)) {
        throw new Error('Name contains invalid characters');
      }
      validated.name = name || undefined;
    } else if (requireAll) {
      throw new Error('Name is required');
    }

    // Validate email
    if (data.email !== undefined) {
      const email = (data.email || '').toString().trim().toLowerCase();
      if (requireAll && !email) {
        throw new Error('Email is required');
      }
      if (email && !this._isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (email && email.length > 100) {
        throw new Error('Email must be less than 100 characters');
      }
      validated.email = email || undefined;
    } else if (requireAll) {
      throw new Error('Email is required');
    }

    // Validate phone (optional)
    if (data.phone !== undefined) {
      const phone = data.phone ? data.phone.toString().trim() : null;
      if (phone) {
        if (phone.length > 20) {
          throw new Error('Phone number must be less than 20 characters');
        }
        if (!this._isValidPhone(phone)) {
          throw new Error('Invalid phone number format');
        }
      }
      validated.phone = phone;
    }

    return validated;
  }

  /**
   * Check if email is valid format
   * @private
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  static _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone number is valid format
   * @private
   * @param {string} phone - Phone to validate
   * @returns {boolean} True if valid
   */
  static _isValidPhone(phone) {
    // Allow various phone formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,20}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Check email uniqueness in database
   * @private
   * @param {string} email - Email to check
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<void>} Throws error if email exists
   */
  static async _checkEmailUniqueness(email, excludeId = null) {
    let sql = 'SELECT id FROM clients WHERE email = ?';
    let params = [email];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const existing = await dbConnection.get(sql, params);
    if (existing) {
      throw new Error('Email address already exists');
    }
  }
}

module.exports = Client;
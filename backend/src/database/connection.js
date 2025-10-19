const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * Database connection module for SQLite
 * Handles database connection, initialization, and error handling
 */
class DatabaseConnection {
  constructor() {
    this.db = null;
    this.dbPath = path.resolve(__dirname, '../../database/clients.db');
    this.isConnected = false;
  }

  /**
   * Initialize database connection
   * Creates database directory if it doesn't exist
   * @returns {Promise<sqlite3.Database>} Database instance
   */
  async connect() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Created database directory: ${dbDir}`);
      }

      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            console.error('❌ Error connecting to database:', err.message);
            reject(err);
          } else {
            console.log(`✅ Connected to SQLite database: ${this.dbPath}`);
            this.isConnected = true;
            
            // Enable foreign key constraints
            this.db.run('PRAGMA foreign_keys = ON;', (err) => {
              if (err) {
                console.warn('⚠️ Could not enable foreign keys:', err.message);
              }
            });
            
            resolve(this.db);
          }
        });
      });
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   * Connects if not already connected
   * @returns {Promise<sqlite3.Database>} Database instance
   */
  async getDatabase() {
    if (!this.isConnected || !this.db) {
      await this.connect();
    }
    return this.db;
  }

  /**
   * Execute a query with parameters
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async run(sql, params = []) {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Database run error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  /**
   * Get single row from database
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} Single row or null
   */
  async get(sql, params = []) {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ Database get error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Get all rows from database
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Array of rows
   */
  async all(sql, params = []) {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Database all error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Execute multiple SQL statements in a transaction
   * @param {Array<Object>} statements - Array of {sql, params} objects
   * @returns {Promise<Array>} Results array
   */
  async transaction(statements) {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        
        const results = [];
        let completed = 0;
        let hasError = false;

        statements.forEach((statement, index) => {
          if (hasError) return;

          db.run(statement.sql, statement.params || [], function(err) {
            if (err && !hasError) {
              hasError = true;
              db.run('ROLLBACK;');
              reject(err);
              return;
            }

            results[index] = {
              lastID: this.lastID,
              changes: this.changes
            };
            
            completed++;
            
            if (completed === statements.length) {
              db.run('COMMIT;', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            }
          });
        });
      });
    });
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.db && this.isConnected) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
            reject(err);
          } else {
            console.log('✅ Database connection closed');
            this.isConnected = false;
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  /**
   * Check if database file exists
   * @returns {boolean} True if database file exists
   */
  exists() {
    return fs.existsSync(this.dbPath);
  }

  /**
   * Get database file path
   * @returns {string} Database file path
   */
  getPath() {
    return this.dbPath;
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await dbConnection.close();
});

process.on('SIGTERM', async () => {
  await dbConnection.close();
});

module.exports = dbConnection;
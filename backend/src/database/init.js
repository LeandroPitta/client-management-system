const dbConnection = require('./connection');

/**
 * Database initialization script
 * Creates all necessary tables and indexes
 */

/**
 * SQL schema for clients table
 * Following the exact requirements from Prompt 2
 */
const CREATE_CLIENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Create indexes for better query performance
 */
const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);`,
  `CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);`,
  `CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);`
];

/**
 * Create trigger to automatically update the updated_at field
 */
const CREATE_UPDATE_TRIGGER = `
  CREATE TRIGGER IF NOT EXISTS update_clients_updated_at 
  AFTER UPDATE ON clients
  FOR EACH ROW
  BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;

/**
 * Initialize database with all tables and constraints
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Connect to database
    const db = await dbConnection.getDatabase();
    console.log('✅ Database connection established');

    // Create clients table
    console.log('📋 Creating clients table...');
    await dbConnection.run(CREATE_CLIENTS_TABLE);
    console.log('✅ Clients table created successfully');

    // Create indexes
    console.log('📊 Creating database indexes...');
    for (const indexSql of CREATE_INDEXES) {
      await dbConnection.run(indexSql);
    }
    console.log('✅ Database indexes created successfully');

    // Create update trigger
    console.log('⚡ Creating update trigger...');
    await dbConnection.run(CREATE_UPDATE_TRIGGER);
    console.log('✅ Update trigger created successfully');

    // Verify table structure
    console.log('🔍 Verifying table structure...');
    const tableInfo = await dbConnection.all(`PRAGMA table_info(clients);`);
    
    console.log('📋 Clients table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.pk ? ' PRIMARY KEY' : ''}`);
    });

    // Check indexes
    const indexes = await dbConnection.all(`PRAGMA index_list(clients);`);
    console.log('📊 Table indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${index.unique ? 'UNIQUE' : 'INDEX'}`);
    });

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

/**
 * Check if database is properly initialized
 * @returns {Promise<boolean>} True if database is initialized
 */
async function isDatabaseInitialized() {
  try {
    const result = await dbConnection.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='clients';
    `);
    return !!result;
  } catch (error) {
    console.error('❌ Error checking database initialization:', error.message);
    return false;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
async function getDatabaseStats() {
  try {
    const clientCount = await dbConnection.get(`SELECT COUNT(*) as count FROM clients;`);
    const dbSize = await dbConnection.get(`PRAGMA page_count;`);
    const pageSize = await dbConnection.get(`PRAGMA page_size;`);
    
    return {
      clientCount: clientCount.count,
      databaseSize: (dbSize.page_count * pageSize.page_size) / 1024, // Size in KB
      tables: ['clients'],
      initialized: true
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message);
    return {
      clientCount: 0,
      databaseSize: 0,
      tables: [],
      initialized: false
    };
  }
}

/**
 * Reset database (drop all tables)
 * Use with caution - this will delete all data!
 * @returns {Promise<void>}
 */
async function resetDatabase() {
  try {
    console.log('⚠️ Resetting database - this will delete all data!');
    
    // Drop trigger first
    await dbConnection.run('DROP TRIGGER IF EXISTS update_clients_updated_at;');
    
    // Drop indexes
    await dbConnection.run('DROP INDEX IF EXISTS idx_clients_email;');
    await dbConnection.run('DROP INDEX IF EXISTS idx_clients_name;');
    await dbConnection.run('DROP INDEX IF EXISTS idx_clients_created_at;');
    
    // Drop table
    await dbConnection.run('DROP TABLE IF EXISTS clients;');
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  initializeDatabase,
  isDatabaseInitialized,
  getDatabaseStats,
  resetDatabase
};

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
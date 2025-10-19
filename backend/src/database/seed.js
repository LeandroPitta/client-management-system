const dbConnection = require('./connection');
const { initializeDatabase, isDatabaseInitialized } = require('./init');

/**
 * Seed data script
 * Populates database with realistic sample client data
 */

/**
 * Sample client data with diverse formats and scenarios
 * Includes different name formats, email domains, and phone formats
 */
const SAMPLE_CLIENTS = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567'
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@gmail.com',
    phone: '555-987-6543'
  },
  {
    name: 'James Johnson Jr.',
    email: 'james.johnson@company.com',
    phone: '(555) 456-7890'
  },
  {
    name: 'Sarah O\'Connor',
    email: 'sarah.oconnor@outlook.com',
    phone: '555.321.9876'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@tech.io',
    phone: '(555) 654-3210'
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@design.co',
    phone: null // Example of optional phone field
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@startup.com',
    phone: '555-789-0123'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@freelance.net',
    phone: '(555) 098-7654'
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@consulting.biz',
    phone: '555 432 1098'
  },
  {
    name: 'Jennifer Davis',
    email: 'jennifer.davis@marketing.agency',
    phone: '(555) 567-8901'
  }
];

/**
 * Insert a single client into the database
 * @param {Object} client - Client data object
 * @returns {Promise<Object>} Inserted client with ID
 */
async function insertClient(client) {
  try {
    const result = await dbConnection.run(
      `INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)`,
      [client.name, client.email, client.phone]
    );

    // Fetch the inserted client to get all fields including timestamps
    const insertedClient = await dbConnection.get(
      `SELECT * FROM clients WHERE id = ?`,
      [result.lastID]
    );

    return insertedClient;
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.warn(`⚠️ Client with email ${client.email} already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

/**
 * Seed database with sample clients
 * @param {boolean} clearFirst - Whether to clear existing data first
 * @returns {Promise<Array>} Array of inserted clients
 */
async function seedDatabase(clearFirst = false) {
  try {
    console.log('🌱 Starting database seeding...');

    // Ensure database is initialized
    const isInitialized = await isDatabaseInitialized();
    if (!isInitialized) {
      console.log('📋 Database not initialized, initializing first...');
      await initializeDatabase();
    }

    // Clear existing data if requested
    if (clearFirst) {
      console.log('🧹 Clearing existing client data...');
      await dbConnection.run('DELETE FROM clients;');
      console.log('✅ Existing data cleared');
    }

    // Check if data already exists
    const existingCount = await dbConnection.get('SELECT COUNT(*) as count FROM clients;');
    if (existingCount.count > 0 && !clearFirst) {
      console.log(`📊 Database already contains ${existingCount.count} clients`);
      console.log('💡 Use seedDatabase(true) to clear existing data first');
      return [];
    }

    console.log(`📝 Inserting ${SAMPLE_CLIENTS.length} sample clients...`);
    
    const insertedClients = [];
    let insertCount = 0;
    let skipCount = 0;

    // Insert each client
    for (const clientData of SAMPLE_CLIENTS) {
      try {
        const insertedClient = await insertClient(clientData);
        if (insertedClient) {
          insertedClients.push(insertedClient);
          insertCount++;
          console.log(`✅ Inserted: ${clientData.name} (${clientData.email})`);
        } else {
          skipCount++;
        }
      } catch (error) {
        console.error(`❌ Error inserting client ${clientData.name}:`, error.message);
        skipCount++;
      }
    }

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  ✅ Successfully inserted: ${insertCount} clients`);
    console.log(`  ⚠️ Skipped (duplicates/errors): ${skipCount} clients`);
    console.log(`  📋 Total clients in database: ${insertCount + existingCount.count - (clearFirst ? existingCount.count : 0)}`);

    // Display sample of inserted data
    if (insertedClients.length > 0) {
      console.log('\n📋 Sample of inserted clients:');
      insertedClients.slice(0, 3).forEach(client => {
        console.log(`  - ID: ${client.id}, Name: ${client.name}, Email: ${client.email}`);
      });
      if (insertedClients.length > 3) {
        console.log(`  ... and ${insertedClients.length - 3} more`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    return insertedClients;

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
}

/**
 * Verify seed data integrity
 * @returns {Promise<Object>} Verification results
 */
async function verifySeedData() {
  try {
    console.log('🔍 Verifying seed data integrity...');

    // Check total count
    const totalCount = await dbConnection.get('SELECT COUNT(*) as count FROM clients;');
    console.log(`📊 Total clients: ${totalCount.count}`);

    // Check for required fields
    const invalidClients = await dbConnection.all(`
      SELECT id, name, email FROM clients 
      WHERE name IS NULL OR name = '' OR email IS NULL OR email = '';
    `);

    if (invalidClients.length > 0) {
      console.error('❌ Found clients with missing required fields:', invalidClients);
      return { valid: false, errors: invalidClients };
    }

    // Check email uniqueness
    const duplicateEmails = await dbConnection.all(`
      SELECT email, COUNT(*) as count 
      FROM clients 
      GROUP BY email 
      HAVING COUNT(*) > 1;
    `);

    if (duplicateEmails.length > 0) {
      console.error('❌ Found duplicate email addresses:', duplicateEmails);
      return { valid: false, errors: duplicateEmails };
    }

    // Check timestamp fields
    const invalidTimestamps = await dbConnection.all(`
      SELECT id, name, created_at, updated_at 
      FROM clients 
      WHERE created_at IS NULL OR updated_at IS NULL;
    `);

    if (invalidTimestamps.length > 0) {
      console.error('❌ Found clients with invalid timestamps:', invalidTimestamps);
      return { valid: false, errors: invalidTimestamps };
    }

    console.log('✅ All seed data integrity checks passed!');
    return { valid: true, errors: [] };

  } catch (error) {
    console.error('❌ Error verifying seed data:', error.message);
    return { valid: false, errors: [error.message] };
  }
}

/**
 * Get sample of clients from database
 * @param {number} limit - Number of clients to retrieve
 * @returns {Promise<Array>} Array of clients
 */
async function getSampleClients(limit = 5) {
  try {
    return await dbConnection.all(`
      SELECT * FROM clients 
      ORDER BY created_at DESC 
      LIMIT ?;
    `, [limit]);
  } catch (error) {
    console.error('❌ Error getting sample clients:', error.message);
    return [];
  }
}

// Export functions
module.exports = {
  seedDatabase,
  verifySeedData,
  getSampleClients,
  SAMPLE_CLIENTS
};

// If this script is run directly, seed the database
if (require.main === module) {
  const clearFirst = process.argv.includes('--clear');
  
  seedDatabase(clearFirst)
    .then(async (clients) => {
      if (clients.length > 0) {
        await verifySeedData();
      }
      console.log('Database seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}
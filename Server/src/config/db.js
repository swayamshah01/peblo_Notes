const { Pool } = require('pg');
const fs = require('fs/promises');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isDatabaseReady = false;
let lastDatabaseError = null;
let schemaInitialized = false;

const testConnection = async () => {
  let client;

  try {
    client = await pool.connect();
    client.release();
    client = null;
    isDatabaseReady = true;
    lastDatabaseError = null;
    console.log('Database connected');
    return true;
  } catch (err) {
    isDatabaseReady = false;
    lastDatabaseError = err.message;
    console.error('DB Error', err.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

pool.on('error', (err) => {
  isDatabaseReady = false;
  lastDatabaseError = err.message;
  console.error('Unexpected database error:', err.message);
});

pool.isReady = () => isDatabaseReady;
pool.getLastError = () => lastDatabaseError;
pool.testConnection = testConnection;
pool.initializeSchema = async () => {
  if (schemaInitialized) return true;

  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    await pool.query(schema);
    schemaInitialized = true;
    console.log('Database schema ready');
    return true;
  } catch (err) {
    schemaInitialized = false;
    lastDatabaseError = err.message;
    console.error('Database schema initialization failed:', err.message);
    return false;
  }
};

testConnection();

module.exports = pool;

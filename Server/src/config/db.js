const { Pool } = require('pg');
const fs = require('fs/promises');
const path = require('path');

const getPoolConfig = () => {
  if (process.env.DB_PASSWORD || process.env.DB_USER || process.env.DB_NAME) {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'peblo_notes',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };
  }

  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'peblo_notes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  };
};

const pool = new Pool(getPoolConfig());

let isDatabaseReady = false;
let lastDatabaseError = null;
let schemaInitialized = false;

const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    isDatabaseReady = true;
    lastDatabaseError = null;
    console.log('Database connected successfully');
    return true;
  } catch (err) {
    isDatabaseReady = false;
    lastDatabaseError = err.message;
    console.error('Database connection failed:', err.message);
    console.error('Check DATABASE_URL in Server/.env and confirm the PostgreSQL user/password are correct.');
    return false;
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

pool.connect()
  .then((client) => {
    client.release();
    isDatabaseReady = true;
    lastDatabaseError = null;
    console.log('Database connected');
  })
  .catch((err) => {
    isDatabaseReady = false;
    lastDatabaseError = err.message;
    console.error('DB Error', err.message);
  });

module.exports = pool;

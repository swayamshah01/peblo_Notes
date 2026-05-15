const { Pool } = require('pg');
const fs = require('fs/promises');
const path = require('path');

const getSslConfig = () => {
  if (process.env.DB_SSL === 'false') {
    return false;
  }

  return { rejectUnauthorized: false };
};

const getPoolConfig = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  return {
    connectionString: process.env.DATABASE_URL,
    ssl: getSslConfig(),
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000),
    keepAlive: true,
  };
};

const pool = new Pool(getPoolConfig());

let isDatabaseReady = false;
let lastDatabaseError = null;
let schemaInitialized = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testConnection = async () => {
  let client;

  try {
    client = await pool.connect();
    client.release();
    client = null;
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
  } finally {
    if (client) client.release();
  }
};

const connectWithRetry = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
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
      console.error(`DB Error attempt ${attempt}/${retries}:`, err.message);

      if (attempt === retries) {
        throw err;
      }

      await wait(delayMs);
    } finally {
      if (client) client.release();
    }
  }

  return false;
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
    await connectWithRetry(
      Number(process.env.DB_CONNECT_RETRIES || 5),
      Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 3000)
    );

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

module.exports = pool;

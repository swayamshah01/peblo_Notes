require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.route');
const aiRoutes = require('./routes/ai.routes');
const sharedRoutes = require('./routes/shared.routes');
const insightRoutes = require('./routes/insights.route');

const app = express();

const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://peblo-notes-mu.vercel.app',
  'http://localhost:5173',
].filter(Boolean).map(normalizeOrigin);

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin);

    if (
      !origin ||
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, normalizedOrigin || true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Peblo Notes API', version: '1.0.0' });
});

app.get('/api/health', async (req, res) => {
  const databaseOk = await pool.testConnection();

  res.status(databaseOk ? 200 : 503).json({
    status: databaseOk ? 'ok' : 'degraded',
    database: databaseOk ? 'connected' : 'unavailable',
    database_error: databaseOk ? null : pool.getLastError(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/api/insights', insightRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  const databaseReady = await pool.initializeSchema();

  if (!databaseReady) {
    console.error('Server startup stopped because the database is not ready.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the old server process or set a different PORT in Server/.env.`);
      return;
    }

    console.error('Server failed to start:', err.message);
  });
};

startServer().catch((err) => {
  console.error('Server startup failed:', err.message);
  process.exit(1);
});

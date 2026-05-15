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

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

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
  await pool.initializeSchema();

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

startServer();

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes    = require('./routes/auth.routes');
const notesRoutes   = require('./routes/notes.route');
const aiRoutes      = require('./routes/ai.routes');
const sharedRoutes  = require('./routes/shared.routes');
const insightRoutes = require('./routes/insights.route');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Root Route ───────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Peblo Notes API', version: '1.0.0' });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',     authRoutes);
app.use('/api/notes',    notesRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/shared',   sharedRoutes);
app.use('/api/insights', insightRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
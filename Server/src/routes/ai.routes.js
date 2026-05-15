const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateSummary } = require('../controllers/ai.controller');

// All AI routes are protected
router.use(auth);

// POST /api/ai/notes/:id/generate-summary
router.post('/notes/:id/generate-summary', generateSummary);

module.exports = router;
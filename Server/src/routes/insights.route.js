const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInsights } = require('../controllers/insights.controller');

// GET /api/insights  (protected)
router.get('/', auth, getInsights);

module.exports = router;
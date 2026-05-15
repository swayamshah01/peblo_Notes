const express = require('express');
const router = express.Router();
const { getSharedNote } = require('../controllers/shared.controller');

// GET /api/shared/:shareId  — public, no auth required
router.get('/:shareId', getSharedNote);

module.exports = router;
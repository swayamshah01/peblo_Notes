const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleShare,
  getUserTags,
} = require('../controllers/notes.controller');

// All notes routes are protected
router.use(auth);

// GET  /api/notes          — list all notes (with search & tag filter)
router.get('/', getNotes);

// GET  /api/notes/tags     — get all tags for current user
router.get('/tags', getUserTags);

// GET  /api/notes/:id      — get single note
router.get('/:id', getNoteById);

// POST /api/notes          — create a new note
router.post('/', createNote);

// PATCH /api/notes/:id     — update note (title, content, tags, is_archived)
router.patch('/:id', updateNote);

// DELETE /api/notes/:id    — delete note
router.delete('/:id', deleteNote);

// PATCH /api/notes/:id/share  — toggle public sharing on/off
router.patch('/:id/share', toggleShare);

module.exports = router;
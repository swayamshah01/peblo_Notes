const pool = require('../config/db');

// Helper: fetch a note with its tags by note id and user id
const getNoteWithTags = async (noteId, userId) => {
  const { rows } = await pool.query(
    `SELECT n.*,
       COALESCE(
         json_agg(
           json_build_object('id', t.id, 'name', t.name)
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) AS tags
     FROM notes n
     LEFT JOIN note_tags nt ON n.id = nt.note_id
     LEFT JOIN tags t ON nt.tag_id = t.id
     WHERE n.id = $1 AND n.user_id = $2
     GROUP BY n.id`,
    [noteId, userId]
  );
  return rows[0] || null;
};

// Helper: sync tags for a note (upsert tags, replace note_tags)
const syncTags = async (client, noteId, userId, tags) => {
  // Remove all existing tag associations for this note
  await client.query('DELETE FROM note_tags WHERE note_id = $1', [noteId]);

  if (!tags || tags.length === 0) return;

  for (const tagName of tags) {
    const trimmed = tagName.trim().toLowerCase();
    if (!trimmed) continue;

    // Upsert tag
    const { rows: tagRows } = await client.query(
      `INSERT INTO tags (name, user_id)
       VALUES ($1, $2)
       ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [trimmed, userId]
    );

    // Link tag to note
    await client.query(
      `INSERT INTO note_tags (note_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [noteId, tagRows[0].id]
    );
  }
};

// GET /api/notes
const getNotes = async (req, res) => {
  const { search, tag, archived } = req.query;
  const userId = req.user.id;
  const params = [userId];
  let conditions = ['n.user_id = $1'];

  // archived filter (default: show non-archived)
  if (archived === 'true') {
    conditions.push('n.is_archived = TRUE');
  } else {
    conditions.push('n.is_archived = FALSE');
  }

  // search filter
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(
      `(n.title ILIKE $${params.length} OR n.content ILIKE $${params.length})`
    );
  }

  const whereClause = conditions.join(' AND ');

  let query = `
    SELECT n.*,
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    WHERE ${whereClause}
    GROUP BY n.id
  `;

  // tag filter — applied after GROUP BY using HAVING
  if (tag && tag.trim()) {
    params.push(tag.trim().toLowerCase());
    query += ` HAVING bool_or(t.name = $${params.length})`;
  }

  query += ' ORDER BY n.updated_at DESC';

  try {
    const { rows } = await pool.query(query, params);
    return res.status(200).json({ notes: rows });
  } catch (err) {
    console.error('GetNotes error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch notes.' });
  }
};

// GET /api/notes/:id
const getNoteById = async (req, res) => {
  try {
    const note = await getNoteWithTags(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    return res.status(200).json({ note });
  } catch (err) {
    console.error('GetNoteById error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch note.' });
  }
};

// POST /api/notes
const createNote = async (req, res) => {
  const { title, content, tags } = req.body;
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO notes (title, content, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title?.trim() || 'Untitled', content || '', userId]
    );
    const note = rows[0];

    if (tags && tags.length > 0) {
      await syncTags(client, note.id, userId, tags);
    }

    await client.query('COMMIT');

    const fullNote = await getNoteWithTags(note.id, userId);
    return res.status(201).json({ note: fullNote });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('CreateNote error:', err.message);
    return res.status(500).json({ error: 'Failed to create note.' });
  } finally {
    client.release();
  }
};

// PATCH /api/notes/:id
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, is_archived } = req.body;
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    // Check ownership
    const existing = await client.query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (existing.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Note not found.' });
    }

    await client.query('BEGIN');

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (title !== undefined) {
      params.push(title.trim() || 'Untitled');
      updates.push(`title = $${params.length}`);
    }
    if (content !== undefined) {
      params.push(content);
      updates.push(`content = $${params.length}`);
    }
    if (is_archived !== undefined) {
      params.push(is_archived);
      updates.push(`is_archived = $${params.length}`);
    }

    if (updates.length > 0) {
      params.push(id);
      params.push(userId);
      await client.query(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = $${params.length - 1} AND user_id = $${params.length}`,
        params
      );
    }

    if (tags !== undefined) {
      await syncTags(client, id, userId, tags);
    }

    await client.query('COMMIT');

    const fullNote = await getNoteWithTags(id, userId);
    return res.status(200).json({ note: fullNote });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('UpdateNote error:', err.message);
    return res.status(500).json({ error: 'Failed to update note.' });
  } finally {
    client.release();
  }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    return res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (err) {
    console.error('DeleteNote error:', err.message);
    return res.status(500).json({ error: 'Failed to delete note.' });
  }
};

// PATCH /api/notes/:id/share  — toggle public sharing
const toggleShare = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      'SELECT is_public, share_id FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Note not found.' });

    const newPublic = !rows[0].is_public;

    await pool.query(
      'UPDATE notes SET is_public = $1 WHERE id = $2 AND user_id = $3',
      [newPublic, id, userId]
    );

    const fullNote = await getNoteWithTags(id, userId);
    return res.status(200).json({
      note: fullNote,
      share_url: newPublic ? `/shared/${fullNote.share_id}` : null,
    });
  } catch (err) {
    console.error('ToggleShare error:', err.message);
    return res.status(500).json({ error: 'Failed to update share status.' });
  }
};

// GET /api/notes/tags  — get all tags for the current user
const getUserTags = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.name, COUNT(nt.note_id) AS note_count
       FROM tags t
       LEFT JOIN note_tags nt ON t.id = nt.tag_id
       WHERE t.user_id = $1
       GROUP BY t.id, t.name
       ORDER BY t.name ASC`,
      [req.user.id]
    );
    return res.status(200).json({ tags: rows });
  } catch (err) {
    console.error('GetUserTags error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch tags.' });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleShare,
  getUserTags,
};

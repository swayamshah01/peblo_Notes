const pool = require('../config/db');

// GET /api/shared/:shareId  — public, no auth required
const getSharedNote = async (req, res) => {
  const { shareId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT n.id, n.title, n.content, n.created_at, n.updated_at,
              u.name AS author_name,
              COALESCE(
                json_agg(
                  json_build_object('id', t.id, 'name', t.name)
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'
              ) AS tags
       FROM notes n
       JOIN users u ON n.user_id = u.id
       LEFT JOIN note_tags nt ON n.id = nt.note_id
       LEFT JOIN tags t ON nt.tag_id = t.id
       WHERE n.share_id = $1 AND n.is_public = TRUE
       GROUP BY n.id, u.name`,
      [shareId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shared note not found or is no longer public.' });
    }

    return res.status(200).json({ note: rows[0] });
  } catch (err) {
    console.error('GetSharedNote error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch shared note.' });
  }
};

module.exports = { getSharedNote };
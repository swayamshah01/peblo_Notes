const pool = require('../config/db');

// GET /api/insights
const getInsights = async (req, res) => {
  const userId = req.user.id;

  try {
    const [
      totalNotesResult,
      archivedNotesResult,
      recentNotesResult,
      topTagsResult,
      aiStatsResult,
      weeklyActivityResult,
      publicNotesResult,
    ] = await Promise.all([
      // Total active notes
      pool.query(
        'SELECT COUNT(*) FROM notes WHERE user_id = $1 AND is_archived = FALSE',
        [userId]
      ),

      // Total archived notes
      pool.query(
        'SELECT COUNT(*) FROM notes WHERE user_id = $1 AND is_archived = TRUE',
        [userId]
      ),

      // Recently edited notes (last 5)
      pool.query(
        `SELECT id, title, updated_at, is_archived
         FROM notes
         WHERE user_id = $1
         ORDER BY updated_at DESC
         LIMIT 5`,
        [userId]
      ),

      // Top 5 most-used tags
      pool.query(
        `SELECT t.name, COUNT(nt.note_id)::int AS count
         FROM tags t
         JOIN note_tags nt ON t.id = nt.tag_id
         JOIN notes n ON nt.note_id = n.id
         WHERE t.user_id = $1 AND n.is_archived = FALSE
         GROUP BY t.name
         ORDER BY count DESC
         LIMIT 5`,
        [userId]
      ),

      // AI calls in last 7 days
      pool.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week
         FROM ai_logs
         WHERE user_id = $1`,
        [userId]
      ),

      // Notes created per day in last 7 days
      pool.query(
        `SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS date,
                COUNT(*)::int AS count
         FROM notes
         WHERE user_id = $1
           AND created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [userId]
      ),

      // Public notes count
      pool.query(
        'SELECT COUNT(*)::int AS count FROM notes WHERE user_id = $1 AND is_public = TRUE',
        [userId]
      ),
    ]);

    // Fill in missing days in weekly activity (last 7 days)
    const activityMap = {};
    weeklyActivityResult.rows.forEach((r) => {
      activityMap[r.date] = r.count;
    });

    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyActivity.push({ date: dateStr, count: activityMap[dateStr] || 0 });
    }

    return res.status(200).json({
      total_notes: parseInt(totalNotesResult.rows[0].count),
      archived_notes: parseInt(archivedNotesResult.rows[0].count),
      public_notes: publicNotesResult.rows[0].count,
      recent_notes: recentNotesResult.rows,
      top_tags: topTagsResult.rows,
      ai_stats: {
        total_calls: aiStatsResult.rows[0].total,
        calls_this_week: aiStatsResult.rows[0].this_week,
      },
      weekly_activity: weeklyActivity,
    });
  } catch (err) {
    console.error('GetInsights error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch insights.' });
  }
};

module.exports = { getInsights };
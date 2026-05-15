const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

const getClient = () => {
  if (!process.env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY is not set in environment variables.');
  }
  return new Anthropic({ apiKey: process.env.LLM_API_KEY });
};

// POST /api/ai/notes/:id/generate-summary
const generateSummary = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the note
    const { rows } = await pool.query(
      'SELECT id, title, content FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const note = rows[0];

    if (!note.content || note.content.trim().length < 10) {
      return res
        .status(400)
        .json({ error: 'Note content is too short to generate a summary.' });
    }

    const client = getClient();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a helpful assistant. Analyze the following note and respond ONLY with a valid JSON object. Do not include any markdown, code blocks, or extra text — just the raw JSON.

The JSON must follow this exact structure:
{
  "summary": "A concise 2-3 sentence summary of the note",
  "action_items": ["action item 1", "action item 2"],
  "suggested_title": "A short, descriptive title for the note"
}

If there are no action items, return an empty array for action_items.

Note Title: ${note.title}
Note Content:
${note.content}`,
        },
      ],
    });

    const rawText = message.content[0].text.trim();

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      // Try to extract JSON if model added extra text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error('AI response not parseable:', rawText);
        return res.status(500).json({ error: 'AI returned an unexpected response format.' });
      }
    }

    // Validate structure
    if (!result.summary || !Array.isArray(result.action_items) || !result.suggested_title) {
      return res.status(500).json({ error: 'AI response is missing required fields.' });
    }

    // Log AI usage
    await pool.query(
      `INSERT INTO ai_logs (note_id, user_id, type) VALUES ($1, $2, 'summary')`,
      [id, userId]
    );

    return res.status(200).json({
      summary: result.summary,
      action_items: result.action_items,
      suggested_title: result.suggested_title,
    });
  } catch (err) {
    console.error('GenerateSummary error:', err.message);

    if (err.message.includes('LLM_API_KEY')) {
      return res.status(500).json({ error: 'AI service is not configured.' });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid AI API key.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI rate limit reached. Please try again later.' });
    }

    return res.status(500).json({ error: 'Failed to generate AI summary.' });
  }
};

module.exports = { generateSummary };
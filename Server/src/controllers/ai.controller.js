const pool = require('../config/db');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

const getGroqKey = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }
  return apiKey;
};

const parseJsonResponse = (rawText) => {
  try {
    return JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned an unexpected response format.');
    }
    return JSON.parse(jsonMatch[0]);
  }
};

const buildPrompt = (note) => `You are a helpful assistant. Analyze the following note and respond ONLY with a valid JSON object. Do not include markdown, code blocks, or extra text.

The JSON must follow this exact structure:
{
  "summary": "A detailed 2-4 paragraph explanation of the note in plain language, expanding the meaning, context, implications, and next steps without inventing facts",
  "summary_points": [
    "Detailed point 1 explained in one complete sentence",
    "Detailed point 2 explained in one complete sentence",
    "Detailed point 3 explained in one complete sentence",
    "Detailed point 4 explained in one complete sentence"
  ],
  "action_items": ["specific action item 1", "specific action item 2"],
  "suggested_title": "A short, descriptive title for the note"
}

Rules:
- Always make the summary detailed and helpful, even if the original note is short.
- Do not add fake facts, names, dates, numbers, or claims that are not in the note.
- You may explain what the note likely means, why it matters, and what the writer may need to do next.
- Return 4-7 summary_points.
- Each point should be specific, practical, and understandable without rereading the note.
- If there are no action items, return an empty array for action_items.

Note Title: ${note.title}
Note Content:
${note.content}`;

const callGroq = async (note) => {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getGroqKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 1600,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You return only valid JSON for a notes app summary feature.',
        },
        {
          role: 'user',
          content: buildPrompt(note),
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error?.message || `Groq request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const rawText = data.choices?.[0]?.message?.content?.trim();
  if (!rawText) {
    throw new Error('AI returned an empty response.');
  }

  return parseJsonResponse(rawText);
};

// POST /api/ai/notes/:id/generate-summary
const generateSummary = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
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

    const result = await callGroq(note);

    if (!result.summary || !Array.isArray(result.action_items) || !result.suggested_title) {
      return res.status(500).json({ error: 'AI response is missing required fields.' });
    }

    const summaryPoints = Array.isArray(result.summary_points)
      ? result.summary_points
      : result.summary
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean);

    await pool.query(
      `INSERT INTO ai_logs (note_id, user_id, type) VALUES ($1, $2, 'summary')`,
      [id, userId]
    );

    return res.status(200).json({
      summary: result.summary,
      summary_points: summaryPoints,
      summaryPoints,
      action_items: result.action_items,
      actionItems: result.action_items,
      suggested_title: result.suggested_title,
      suggestedTitle: result.suggested_title,
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
    });
  } catch (err) {
    console.error('GenerateSummary error:', err.message);

    if (err.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({ error: 'Groq AI service is not configured.' });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid Groq API key.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Groq rate limit reached. Please try again later.' });
    }

    return res.status(500).json({ error: 'Failed to generate AI summary.' });
  }
};

module.exports = { generateSummary };

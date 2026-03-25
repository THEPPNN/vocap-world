const express        = require('express');
const pool           = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ─── GET all vocab for current user ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         v.*,
         COALESCE(
           json_agg(s.synonym ORDER BY s.id)
           FILTER (WHERE s.id IS NOT NULL), '[]'
         ) AS synonyms
       FROM vocabulary v
       LEFT JOIN synonyms s ON s.vocab_id = v.id
       WHERE v.user_id = $1
       GROUP BY v.id
       ORDER BY v.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST add new vocab ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { word, translation, example_sentence, synonyms = [] } = req.body;

  if (!word?.trim() || !translation?.trim()) {
    return res.status(400).json({ error: 'Word and translation are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO vocabulary (user_id, word, translation, example_sentence)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, word.trim(), translation.trim(), example_sentence?.trim() || null]
    );
    const vocab = rows[0];

    const cleanSyns = synonyms.map(s => s.trim()).filter(Boolean);
    for (const syn of cleanSyns) {
      await client.query(
        'INSERT INTO synonyms (vocab_id, synonym) VALUES ($1, $2)',
        [vocab.id, syn]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ...vocab, synonyms: cleanSyns });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ─── PUT update vocab ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const vocabId = parseInt(req.params.id, 10);
  const { word, translation, example_sentence, synonyms = [] } = req.body;

  if (!word?.trim() || !translation?.trim()) {
    return res.status(400).json({ error: 'Word and translation are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: own } = await client.query(
      'SELECT id FROM vocabulary WHERE id = $1 AND user_id = $2',
      [vocabId, req.user.id]
    );
    if (!own.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }

    const { rows } = await client.query(
      `UPDATE vocabulary
       SET word = $1, translation = $2, example_sentence = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [word.trim(), translation.trim(), example_sentence?.trim() || null, vocabId]
    );

    await client.query('DELETE FROM synonyms WHERE vocab_id = $1', [vocabId]);
    const cleanSyns = synonyms.map(s => s.trim()).filter(Boolean);
    for (const syn of cleanSyns) {
      await client.query(
        'INSERT INTO synonyms (vocab_id, synonym) VALUES ($1, $2)',
        [vocabId, syn]
      );
    }

    await client.query('COMMIT');
    res.json({ ...rows[0], synonyms: cleanSyns });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ─── PATCH toggle mastered ────────────────────────────────────────────────────
router.patch('/:id/mastered', async (req, res) => {
  const vocabId    = parseInt(req.params.id, 10);
  const { is_mastered } = req.body;

  if (typeof is_mastered !== 'boolean') {
    return res.status(400).json({ error: 'is_mastered must be boolean' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE vocabulary
       SET is_mastered = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING id, is_mastered`,
      [is_mastered, vocabId, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE vocab ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM vocabulary WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
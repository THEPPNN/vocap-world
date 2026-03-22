/**
 * VocabVault Database Migration Runner
 * Run: npm run migrate
 */

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway PostgreSQL requires SSL in production
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : false,
});

async function migrate() {
  const client = await pool.connect();
  console.log('🔌 Connected to database');

  try {
    // Ensure the tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id          SERIAL PRIMARY KEY,
        filename    VARCHAR(255) UNIQUE NOT NULL,
        applied_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const dir   = __dirname;
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM migrations WHERE filename = $1', [file]
      );

      if (rows.length > 0) {
        console.log(`  ↷  Skipped  : ${file}`);
        continue;
      }

      console.log(`  ▶  Applying : ${file}`);
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)', [file]
        );
        await client.query('COMMIT');
        console.log(`  ✓  Applied  : ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('\n✅  Migration complete!');
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
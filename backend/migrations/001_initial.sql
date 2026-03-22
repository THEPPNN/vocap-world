-- ==========================================
-- Migration 001: Initial Schema
-- VocabVault Database Setup
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word             VARCHAR(255) NOT NULL,
  translation      TEXT NOT NULL,
  example_sentence TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);

-- Synonyms table
CREATE TABLE IF NOT EXISTS synonyms (
  id       SERIAL PRIMARY KEY,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  synonym  VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_synonyms_vocab_id ON synonyms(vocab_id);

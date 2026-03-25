-- Migration 002: Add is_mastered flag to vocabulary
ALTER TABLE vocabulary
  ADD COLUMN IF NOT EXISTS is_mastered BOOLEAN NOT NULL DEFAULT FALSE;
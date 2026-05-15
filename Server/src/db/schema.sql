-- Run this file once to set up your database
-- psql -U postgres -d peblo_notes -f src/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) DEFAULT 'Untitled',
  content     TEXT DEFAULT '',
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_public   BOOLEAN DEFAULT FALSE,
  share_id    UUID UNIQUE DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name    VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Note-Tag junction table
CREATE TABLE IF NOT EXISTS note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- AI usage logs
CREATE TABLE IF NOT EXISTS ai_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id    UUID REFERENCES notes(id) ON DELETE SET NULL,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL CHECK (type IN ('summary')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-update updated_at on notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- AI Learning Platform Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zqhgpyagxlrpgjblxooc/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student','teacher','admin')),
    hashed_password TEXT NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    description  TEXT,
    teacher_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- 3. Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    "order"     INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_pct FLOAT DEFAULT 0,
    enrolled_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- 5. Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         TEXT NOT NULL,
    material_type TEXT NOT NULL CHECK (material_type IN ('pdf','docx','text','sheet')),
    module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
    storage_path  TEXT,
    storage_url   TEXT,
    raw_text      TEXT,
    status        TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','ready','error')),
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 6. Create chunks table for RAG (Vector embeddings)
-- Note: Requires pgvector extension - enable it in Supabase Extensions
CREATE TABLE IF NOT EXISTS chunks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    chunk_text  TEXT NOT NULL,
    chunk_index INT NOT NULL,
    embedding   vector(1536),
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_material_id ON chunks(material_id);

-- 7. Create MCQs table
CREATE TABLE IF NOT EXISTS mcqs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    options       JSONB NOT NULL,
    correct_index INT NOT NULL,
    explanation   TEXT,
    difficulty    TEXT DEFAULT 'medium'
                  CHECK (difficulty IN ('easy','medium','hard')),
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 8. Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    mcq_id          UUID REFERENCES mcqs(id) ON DELETE CASCADE,
    selected_option INT NOT NULL,
    is_correct      BOOLEAN NOT NULL,
    attempted_at    TIMESTAMPTZ DEFAULT now()
);

-- 9. Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    status      TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','reviewed','approved','rejected')),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Verify all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
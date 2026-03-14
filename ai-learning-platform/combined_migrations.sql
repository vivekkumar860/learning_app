CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student','teacher','admin')),
    hashed_password TEXT NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE TABLE courses (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    description  TEXT,
    teacher_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE modules (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    "order"     INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE enrollments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_pct FLOAT DEFAULT 0,
    enrolled_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE materials (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         TEXT NOT NULL,
    material_type TEXT NOT NULL CHECK (material_type IN ('pdf','docx','text','sheet')),
    module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
    storage_path  TEXT,
    storage_url   TEXT,
    raw_text      TEXT,
    status        TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','ready','failed')),
    chunk_count   INT DEFAULT 0,
    uploaded_by   UUID REFERENCES users(id),
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE mcqs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question    TEXT NOT NULL,
    explanation TEXT,
    difficulty  INT DEFAULT 1,
    topic_tag   TEXT,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    module_id   UUID REFERENCES modules(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mcq_options (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mcq_id     UUID REFERENCES mcqs(id) ON DELETE CASCADE,
    text       TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE attempts (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
    mcq_id                UUID REFERENCES mcqs(id) ON DELETE CASCADE,
    selected_option_index INT NOT NULL,
    is_correct            BOOLEAN NOT NULL,
    attempted_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE material_chunks (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id  UUID REFERENCES materials(id) ON DELETE CASCADE,
    chunk_index  INT NOT NULL,
    content      TEXT NOT NULL,
    embedding    vector(1536),
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chunks_material ON material_chunks(material_id);

-- Supabase RPC for semantic search
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding vector(1536),
    match_course_id UUID,
    match_count     INT DEFAULT 5
)
RETURNS TABLE (
    id          UUID,
    material_id UUID,
    content     TEXT,
    similarity  FLOAT
)
LANGUAGE SQL STABLE AS $$
    SELECT
        mc.id,
        mc.material_id,
        mc.content,
        1 - (mc.embedding <=> query_embedding) AS similarity
    FROM material_chunks mc
    JOIN materials m  ON mc.material_id  = m.id
    JOIN modules   mo ON m.module_id     = mo.id
    WHERE mo.course_id = match_course_id
    ORDER BY mc.embedding <=> query_embedding
    LIMIT match_count;
$$;
CREATE TABLE suggestions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id       UUID REFERENCES modules(id) ON DELETE SET NULL,
    content         TEXT NOT NULL,
    suggestion_type TEXT NOT NULL DEFAULT 'note',
    description     TEXT,
    status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
    submitted_by    UUID REFERENCES users(id),
    reviewed_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    reviewed_at     TIMESTAMPTZ
);

CREATE INDEX idx_suggestions_status ON suggestions(status);

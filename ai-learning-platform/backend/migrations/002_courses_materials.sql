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

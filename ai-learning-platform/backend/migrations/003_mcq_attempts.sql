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

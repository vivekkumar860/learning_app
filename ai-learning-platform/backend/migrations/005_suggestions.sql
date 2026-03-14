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

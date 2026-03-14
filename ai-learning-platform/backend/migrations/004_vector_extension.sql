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

from services.supabase_client import get_supabase
from services.embeddings import embed


def upsert_chunks(chunks: list[dict]):
    """
    chunks: [{"material_id": ..., "chunk_index": ..., "content": ..., "embedding": [...]}]
    Supabase table: material_chunks (id, material_id, chunk_index, content, embedding vector(1536))
    """
    sb = get_supabase()
    sb.table("material_chunks").upsert(chunks).execute()


def semantic_search(query: str, course_id: str, top_k: int = 5) -> list[dict]:
    """
    Calls a Supabase RPC function `match_chunks` that does pgvector cosine search.
    Returns list of {content, material_id, similarity}.
    """
    query_embedding = embed(query)
    sb = get_supabase()
    result = sb.rpc(
        "match_chunks",
        {"query_embedding": query_embedding, "match_course_id": course_id, "match_count": top_k},
    ).execute()
    return result.data or []

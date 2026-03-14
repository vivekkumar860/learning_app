import uuid
from services.supabase_client import get_supabase
from services.embeddings import embed_batch
from services.vector_store import upsert_chunks
from utils.pdf_parser import extract_text_from_pdf
from utils.docx_parser import extract_text_from_docx
from utils.chunker import chunk_text


def ingest_material(material_id: str, storage_path: str, file_bytes: bytes, file_type: str):
    """
    Full ingestion pipeline:
    1. Extract text from file
    2. Chunk the text
    3. Embed chunks
    4. Store in material_chunks table
    5. Update material status to 'ready'
    """
    sb = get_supabase()
    sb.table("materials").update({"status": "processing"}).eq("id", material_id).execute()

    try:
        if file_type == "pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        elif file_type == "docx":
            raw_text = extract_text_from_docx(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        chunks = chunk_text(raw_text, chunk_size=500, overlap=50)
        embeddings = embed_batch(chunks)

        records = [
            {
                "id": str(uuid.uuid4()),
                "material_id": material_id,
                "chunk_index": i,
                "content": chunk,
                "embedding": emb,
            }
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
        ]
        upsert_chunks(records)

        sb.table("materials").update({
            "status": "ready",
            "chunk_count": len(records),
        }).eq("id", material_id).execute()

    except Exception as e:
        sb.table("materials").update({"status": "failed"}).eq("id", material_id).execute()
        raise e


def ingest_raw_text(material_id: str, raw_text: str):
    """For manually written notes or Google Sheets content."""
    sb = get_supabase()
    chunks = chunk_text(raw_text, chunk_size=500, overlap=50)
    embeddings = embed_batch(chunks)
    records = [
        {
            "id": str(uuid.uuid4()),
            "material_id": material_id,
            "chunk_index": i,
            "content": chunk,
            "embedding": emb,
        }
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
    ]
    upsert_chunks(records)
    sb.table("materials").update({"status": "ready", "chunk_count": len(records)}).eq("id", material_id).execute()

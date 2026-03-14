import uuid
from fastapi import UploadFile, HTTPException
from config import settings
from services.supabase_client import get_supabase

BUCKET = "materials"
ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_BYTES = settings.max_upload_mb * 1024 * 1024


async def upload_material(file: UploadFile, course_id: str) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PDF and DOCX files are allowed.")

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(413, f"File exceeds {settings.max_upload_mb}MB limit.")

    ext = file.filename.rsplit(".", 1)[-1]
    path = f"{course_id}/{uuid.uuid4()}.{ext}"

    sb = get_supabase()
    sb.storage.from_(BUCKET).upload(path, content, {"content-type": file.content_type})

    public_url = sb.storage.from_(BUCKET).get_public_url(path)
    return {"storage_path": path, "storage_url": public_url, "size_bytes": len(content)}


def delete_material(storage_path: str):
    sb = get_supabase()
    sb.storage.from_(BUCKET).remove([storage_path])

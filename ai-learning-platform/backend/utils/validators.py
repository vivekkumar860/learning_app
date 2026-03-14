from fastapi import HTTPException

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_MB = 20

def validate_file_extension(filename: str):
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '.{ext}'. Allowed: {ALLOWED_EXTENSIONS}")
    return ext

def validate_file_size(size_bytes: int):
    if size_bytes > MAX_MB * 1024 * 1024:
        raise HTTPException(413, f"File too large. Max {MAX_MB}MB allowed.")

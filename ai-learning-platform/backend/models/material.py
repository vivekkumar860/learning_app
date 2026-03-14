from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class MaterialType(str, Enum):
    pdf    = "pdf"
    docx   = "docx"
    text   = "text"
    sheet  = "sheet"  # imported from Google Sheets

class MaterialStatus(str, Enum):
    pending    = "pending"
    processing = "processing"
    ready      = "ready"
    failed     = "failed"

class MaterialBase(BaseModel):
    title: str
    material_type: MaterialType
    module_id: str

class MaterialCreate(MaterialBase):
    storage_path: Optional[str] = None
    raw_text: Optional[str] = None

class MaterialOut(MaterialBase):
    id: str
    status: MaterialStatus
    storage_url: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime
    uploaded_by: str

class ChunkOut(BaseModel):
    id: str
    material_id: str
    content: str
    chunk_index: int

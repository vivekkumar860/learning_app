from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class SuggestionStatus(str, Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"

class SuggestionCreate(BaseModel):
    course_id: str
    module_id: Optional[str] = None
    content: str               # plain text, MCQ JSON, or note
    suggestion_type: str       # "note" | "mcq" | "resource_link"
    description: Optional[str] = None

class SuggestionOut(SuggestionCreate):
    id: str
    status: SuggestionStatus
    submitted_by: str
    reviewed_by: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0

class ModuleCreate(ModuleBase):
    course_id: str

class ModuleOut(ModuleBase):
    id: str
    course_id: str
    created_at: datetime

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_published: bool = False

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: str
    teacher_id: str
    created_at: datetime
    modules: List[ModuleOut] = []

class EnrollmentOut(BaseModel):
    id: str
    user_id: str
    course_id: str
    progress_pct: float = 0.0
    enrolled_at: datetime

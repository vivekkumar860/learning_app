from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class OptionBase(BaseModel):
    text: str
    is_correct: bool = False

class MCQBase(BaseModel):
    question: str
    explanation: Optional[str] = None
    difficulty: int = 1          # 1=easy, 2=medium, 3=hard
    topic_tag: Optional[str] = None
    material_id: Optional[str] = None
    module_id: str

class MCQCreate(MCQBase):
    options: List[OptionBase]

class MCQOut(MCQBase):
    id: str
    options: List[OptionBase]
    created_at: datetime

class AttemptCreate(BaseModel):
    mcq_id: str
    selected_option_index: int

class AttemptOut(BaseModel):
    id: str
    user_id: str
    mcq_id: str
    is_correct: bool
    selected_option_index: int
    attempted_at: datetime

class QuizResultOut(BaseModel):
    total: int
    correct: int
    score_pct: float
    weak_topics: List[str]
    attempts: List[AttemptOut]

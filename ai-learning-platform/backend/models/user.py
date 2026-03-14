from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional

class Role(str, Enum):
    student = "student"
    teacher = "teacher"
    admin   = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Role = Role.student

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime
    is_active: bool = True

class UserInDB(UserOut):
    hashed_password: str

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[Role] = None

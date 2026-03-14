import uuid
from fastapi import APIRouter, Depends
from models.course import CourseCreate, CourseOut, ModuleCreate, ModuleOut
from models.user import Role, TokenData
from services.supabase_client import get_supabase
from utils.auth_helpers import get_current_user, require_role

router = APIRouter()


@router.get("/", response_model=list[CourseOut])
async def list_courses(current_user: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("courses").select("*, modules(*)").eq("is_published", True).execute()
    return result.data


@router.post("/", response_model=CourseOut)
async def create_course(
    body: CourseCreate,
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    sb = get_supabase()
    result = sb.table("courses").insert({
        "id": str(uuid.uuid4()),
        "title": body.title,
        "description": body.description,
        "teacher_id": current_user.user_id,
        "is_published": body.is_published,
    }).execute()
    return result.data[0]


@router.post("/{course_id}/modules", response_model=ModuleOut)
async def create_module(
    course_id: str,
    body: ModuleCreate,
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    sb = get_supabase()
    result = sb.table("modules").insert({
        "id": str(uuid.uuid4()),
        "course_id": course_id,
        "title": body.title,
        "description": body.description,
        "order": body.order,
    }).execute()
    return result.data[0]


@router.post("/{course_id}/enroll")
async def enroll(course_id: str, current_user: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    sb.table("enrollments").upsert({
        "id": str(uuid.uuid4()),
        "user_id": current_user.user_id,
        "course_id": course_id,
        "progress_pct": 0.0,
    }).execute()
    return {"status": "enrolled"}

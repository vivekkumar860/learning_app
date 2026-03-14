from fastapi import APIRouter, Depends
from models.user import Role, TokenData
from services.supabase_client import get_supabase
from utils.auth_helpers import require_role

router = APIRouter()


@router.get("/suggestions")
async def list_pending(current_user: TokenData = Depends(require_role(Role.teacher, Role.admin))):
    sb = get_supabase()
    return sb.table("suggestions").select("*, users(full_name, email)").eq("status", "pending").execute().data


@router.patch("/suggestions/{suggestion_id}")
async def review_suggestion(
    suggestion_id: str,
    body: dict,
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    sb = get_supabase()
    result = sb.table("suggestions").update({
        "status": body["status"],      # "approved" | "rejected"
        "reviewed_by": current_user.user_id,
    }).eq("id", suggestion_id).execute()
    return result.data[0]


@router.get("/users")
async def list_users(current_user: TokenData = Depends(require_role(Role.admin))):
    sb = get_supabase()
    return sb.table("users").select("id, email, full_name, role, is_active, created_at").execute().data


@router.patch("/users/{user_id}/role")
async def change_role(
    user_id: str,
    body: dict,
    current_user: TokenData = Depends(require_role(Role.admin)),
):
    sb = get_supabase()
    return sb.table("users").update({"role": body["role"]}).eq("id", user_id).execute().data[0]

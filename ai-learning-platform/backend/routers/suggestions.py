import uuid
from fastapi import APIRouter, Depends
from models.suggestion import SuggestionCreate, SuggestionOut
from models.user import TokenData
from services.supabase_client import get_supabase
from utils.auth_helpers import get_current_user

router = APIRouter()


@router.post("/", response_model=SuggestionOut)
async def submit_suggestion(body: SuggestionCreate, current_user: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("suggestions").insert({
        "id": str(uuid.uuid4()),
        **body.model_dump(),
        "status": "pending",
        "submitted_by": current_user.user_id,
    }).execute()
    return result.data[0]


@router.get("/my", response_model=list[SuggestionOut])
async def my_suggestions(current_user: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    return sb.table("suggestions").select("*").eq("submitted_by", current_user.user_id).execute().data

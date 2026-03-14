from fastapi import APIRouter, HTTPException
from models.user import UserCreate, UserOut, TokenPair
from services.supabase_client import get_supabase
from utils.auth_helpers import hash_password, verify_password, create_access_token, create_refresh_token

router = APIRouter()


@router.post("/register", response_model=UserOut)
async def register(body: UserCreate):
    sb = get_supabase()
    existing = sb.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(400, "Email already registered.")
    hashed = hash_password(body.password)
    result = sb.table("users").insert({
        "email": body.email,
        "full_name": body.full_name,
        "role": body.role,
        "hashed_password": hashed,
    }).execute()
    return result.data[0]


@router.post("/login", response_model=TokenPair)
async def login(body: dict):
    sb = get_supabase()
    result = sb.table("users").select("*").eq("email", body["email"]).execute()
    if not result.data or len(result.data) == 0:
        raise HTTPException(401, "Invalid credentials.")
    user = result.data[0]
    if not verify_password(body["password"], user["hashed_password"]):
        raise HTTPException(401, "Invalid credentials.")
    return TokenPair(
        access_token=create_access_token(user["id"], user["role"]),
        refresh_token=create_refresh_token(user["id"]),
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(body: dict):
    from jose import jwt, JWTError
    from config import settings
    try:
        payload = jwt.decode(body["refresh_token"], settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        sb = get_supabase()
        user = sb.table("users").select("*").eq("id", user_id).execute().data[0]
        return TokenPair(
            access_token=create_access_token(user["id"], user["role"]),
            refresh_token=create_refresh_token(user["id"]),
        )
    except (JWTError, IndexError):
        raise HTTPException(401, "Invalid refresh token.")

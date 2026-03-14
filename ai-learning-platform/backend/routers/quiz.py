import uuid
from fastapi import APIRouter, Depends
from models.quiz import MCQCreate, MCQOut, AttemptCreate, QuizResultOut
from models.user import TokenData
from services.supabase_client import get_supabase
from services.summariser import identify_weak_topics
from utils.auth_helpers import get_current_user, require_role
from models.user import Role

router = APIRouter()


@router.get("/{module_id}", response_model=list[MCQOut])
async def get_mcqs(module_id: str, _: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("mcqs").select("*, options(*)").eq("module_id", module_id).execute()
    return result.data


@router.post("/", response_model=MCQOut)
async def create_mcq(
    body: MCQCreate,
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    sb = get_supabase()
    mcq_id = str(uuid.uuid4())
    sb.table("mcqs").insert({"id": mcq_id, **body.model_dump(exclude={"options"})}).execute()
    for opt in body.options:
        sb.table("mcq_options").insert({"id": str(uuid.uuid4()), "mcq_id": mcq_id, **opt.model_dump()}).execute()
    return sb.table("mcqs").select("*, options(*)").eq("id", mcq_id).execute().data[0]


@router.post("/attempt", response_model=dict)
async def submit_attempt(body: AttemptCreate, current_user: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    options = sb.table("mcq_options").select("*").eq("mcq_id", body.mcq_id).order("created_at").execute().data
    if body.selected_option_index >= len(options):
        return {"error": "Invalid option index"}
    is_correct = options[body.selected_option_index]["is_correct"]
    sb.table("attempts").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user.user_id,
        "mcq_id": body.mcq_id,
        "selected_option_index": body.selected_option_index,
        "is_correct": is_correct,
    }).execute()
    return {"is_correct": is_correct, "explanation": sb.table("mcqs").select("explanation").eq("id", body.mcq_id).execute().data[0].get("explanation")}


@router.get("/results/{module_id}", response_model=QuizResultOut)
async def get_results(module_id: str, current_user: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    attempts = sb.table("attempts").select("*, mcqs(question, topic_tag)").eq("user_id", current_user.user_id).execute().data
    total = len(attempts)
    correct = sum(1 for a in attempts if a["is_correct"])
    wrong_questions = [a["mcqs"]["question"] for a in attempts if not a["is_correct"]]
    weak = identify_weak_topics(current_user.user_id, module_id, wrong_questions[:10]) if wrong_questions else []
    return QuizResultOut(
        total=total, correct=correct,
        score_pct=round(correct / total * 100, 1) if total else 0.0,
        weak_topics=weak, attempts=attempts,
    )

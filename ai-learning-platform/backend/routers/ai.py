from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from models.user import TokenData
from services.vector_store import semantic_search
from services.llm import load_prompt, stream_chat
from services.mcq_generator import generate_mcqs_from_text
from services.summariser import summarise_topic
from utils.auth_helpers import get_current_user

router = APIRouter()


@router.post("/ask")
async def ask_tutor(body: dict, current_user: TokenData = Depends(get_current_user)):
    """RAG-powered tutor — streams response."""
    question = body["question"]
    course_id = body["course_id"]
    history = body.get("history", [])   # [{role, content}, ...]

    chunks = semantic_search(question, course_id, top_k=5)
    context = "\n\n---\n\n".join(c["content"] for c in chunks)

    system = load_prompt("rag_system").replace("{{CONTEXT}}", context)
    messages = history + [{"role": "user", "content": question}]

    def event_generator():
        for chunk in stream_chat(system, messages):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/generate-mcqs")
async def generate_mcqs(body: dict, current_user: TokenData = Depends(get_current_user)):
    """Generate MCQs from provided text or course material."""
    text = body.get("text", "")
    count = body.get("count", 5)
    difficulty = body.get("difficulty", 1)
    return generate_mcqs_from_text(text, count=count, difficulty=difficulty)


@router.post("/summarise")
async def summarise(body: dict, current_user: TokenData = Depends(get_current_user)):
    topic = body["topic"]
    course_id = body["course_id"]
    return {"summary": summarise_topic(topic, course_id)}

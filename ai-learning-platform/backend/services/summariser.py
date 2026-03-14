from services.llm import chat, load_prompt
from services.vector_store import semantic_search


def summarise_topic(query: str, course_id: str) -> str:
    chunks = semantic_search(query, course_id, top_k=6)
    context = "\n\n".join(c["content"] for c in chunks)
    system = load_prompt("summarise")
    return chat(system, f"TOPIC: {query}\n\nCONTEXT:\n{context}", max_tokens=800)


def identify_weak_topics(user_id: str, course_id: str, wrong_questions: list[str]) -> list[str]:
    """Given a list of questions the user got wrong, identify weak topic areas."""
    system = load_prompt("weak_topic")
    user_msg = "Wrong questions:\n" + "\n".join(f"- {q}" for q in wrong_questions)
    raw = chat(system, user_msg, max_tokens=300)
    return [t.strip() for t in raw.split(",") if t.strip()]

import json
from services.llm import chat, load_prompt
from services.vector_store import semantic_search


def generate_mcqs_from_text(text: str, count: int = 5, difficulty: int = 1) -> list[dict]:
    """
    Returns list of MCQ dicts:
    [{"question": ..., "options": [...], "correct_index": 0, "explanation": ..., "topic_tag": ...}]
    """
    system = load_prompt("mcq_gen")
    user_msg = f"TEXT:\n{text}\n\nGenerate exactly {count} MCQs. Difficulty level: {difficulty}/3. Return ONLY valid JSON array."
    raw = chat(system, user_msg, max_tokens=2048)

    # Strip markdown fences if present
    clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(clean)


def generate_mcqs_for_material(material_id: str, course_id: str, count: int = 5) -> list[dict]:
    """Pull top chunks for a material and generate MCQs."""
    chunks = semantic_search("key concepts", course_id, top_k=8)
    combined_text = "\n\n".join(c["content"] for c in chunks[:6])
    return generate_mcqs_from_text(combined_text, count=count)

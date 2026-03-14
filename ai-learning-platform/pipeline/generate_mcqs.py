#!/usr/bin/env python3
"""
Bulk MCQ generation for all 'ready' materials in a course.
Usage: python generate_mcqs.py <course_id> [count_per_material]
"""
import sys, uuid
sys.path.insert(0, "../backend")

from dotenv import load_dotenv
load_dotenv("../.env")

from services.supabase_client import get_supabase
from services.mcq_generator import generate_mcqs_from_text
from services.vector_store import semantic_search

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_mcqs.py <course_id> [count]")
        sys.exit(1)

    course_id = sys.argv[1]
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    sb = get_supabase()
    # Get all modules in course
    modules = sb.table("modules").select("id,title").eq("course_id", course_id).execute().data
    for module in modules:
        chunks = semantic_search("main concepts", course_id, top_k=8)
        if not chunks:
            continue
        text = "\n\n".join(c["content"] for c in chunks[:6])
        mcqs = generate_mcqs_from_text(text, count=count)
        for mcq in mcqs:
            mcq_id = str(uuid.uuid4())
            sb.table("mcqs").insert({
                "id": mcq_id,
                "question": mcq["question"],
                "explanation": mcq.get("explanation"),
                "topic_tag": mcq.get("topic_tag"),
                "module_id": module["id"],
                "difficulty": 1,
            }).execute()
            for i, opt in enumerate(mcq["options"]):
                sb.table("mcq_options").insert({
                    "id": str(uuid.uuid4()),
                    "mcq_id": mcq_id,
                    "text": opt,
                    "is_correct": (i == mcq.get("correct_index", 0)),
                }).execute()
        print(f"Module '{module['title']}': inserted {len(mcqs)} MCQs")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
CLI script to ingest a PDF into a course.
Usage: python ingest_pdf.py <path_to_pdf> <course_id> <module_id> <title>
"""
import sys, uuid
sys.path.insert(0, "../backend")

from dotenv import load_dotenv
load_dotenv("../.env")

from services.supabase_client import get_supabase
from services.ingestion import ingest_material
from utils.pdf_parser import extract_text_from_pdf

def main():
    if len(sys.argv) < 5:
        print("Usage: python ingest_pdf.py <pdf_path> <course_id> <module_id> <title>")
        sys.exit(1)

    pdf_path, course_id, module_id, title = sys.argv[1:5]
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    sb = get_supabase()
    material_id = str(uuid.uuid4())
    sb.table("materials").insert({
        "id": material_id,
        "title": title,
        "material_type": "pdf",
        "module_id": module_id,
        "status": "pending",
        "uploaded_by": "system",
    }).execute()

    print(f"Ingesting '{title}' (material_id: {material_id})...")
    ingest_material(material_id, "", file_bytes, "pdf")
    print("Done! Chunks embedded and stored.")

if __name__ == "__main__":
    main()

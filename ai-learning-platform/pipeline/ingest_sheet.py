#!/usr/bin/env python3
"""
Pull MCQs from a Google Sheet and insert into the DB.
Sheet columns: question | option_a | option_b | option_c | option_d | correct_index | explanation | topic_tag | module_id
Usage: python ingest_sheet.py <sheet_id>
"""
import sys, uuid
sys.path.insert(0, "../backend")

from dotenv import load_dotenv
load_dotenv("../.env")

import gspread
from google.oauth2.service_account import Credentials
from services.supabase_client import get_supabase
import json, os

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest_sheet.py <sheet_id>")
        sys.exit(1)

    sheet_id = sys.argv[1]
    creds_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    creds = Credentials.from_service_account_info(json.loads(creds_json), scopes=SCOPES)
    gc = gspread.authorize(creds)
    ws = gc.open_by_key(sheet_id).sheet1
    rows = ws.get_all_records()

    sb = get_supabase()
    inserted = 0
    for row in rows:
        mcq_id = str(uuid.uuid4())
        sb.table("mcqs").insert({
            "id": mcq_id,
            "question": row["question"],
            "explanation": row.get("explanation"),
            "topic_tag": row.get("topic_tag"),
            "module_id": row["module_id"],
            "difficulty": int(row.get("difficulty", 1)),
        }).execute()
        options = [row["option_a"], row["option_b"], row["option_c"], row["option_d"]]
        correct_index = int(row.get("correct_index", 0))
        for i, opt in enumerate(options):
            sb.table("mcq_options").insert({
                "id": str(uuid.uuid4()),
                "mcq_id": mcq_id,
                "text": opt,
                "is_correct": (i == correct_index),
            }).execute()
        inserted += 1

    print(f"Inserted {inserted} MCQs from Google Sheet.")

if __name__ == "__main__":
    main()

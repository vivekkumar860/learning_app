#!/usr/bin/env python3
"""
Setup Supabase tables using the Python client
"""
from supabase import create_client, Client
import os

# Your Supabase credentials - MUST be set as environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url_here")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "your_service_key_here")  # This needs to be the full service role key

def setup_tables():
    """Create all necessary tables in Supabase"""
    print("🔄 Connecting to Supabase...")

    # Note: For creating tables, you'll need to use Supabase SQL Editor
    # The Python client can't create tables directly

    print("\n⚠️  IMPORTANT: Database table creation requires using the Supabase SQL Editor")
    print("\nPlease follow these steps:")
    print("\n1. Go to: https://supabase.com/dashboard/project/zqhgpyagxlrpgjblxooc/sql/new")
    print("2. Copy and paste the contents of 'create_all_tables.sql'")
    print("3. Click 'Run' to execute the SQL")
    print("\n4. After tables are created, get your Service Role Key:")
    print("   - Go to: https://supabase.com/dashboard/project/zqhgpyagxlrpgjblxooc/settings/api")
    print("   - Copy the 'service_role' key (not the anon key)")
    print("   - Update the SUPABASE_SERVICE_KEY in backend/.env")
    print("\n5. Then update backend/services/supabase_client.py to use real Supabase instead of mock")
    print("\n✅ The SQL file 'create_all_tables.sql' is ready to use!")
    print("\n📁 File location: /Users/shubhamkumar/Desktop/vivek/learning_app/ai-learning-platform/create_all_tables.sql")

if __name__ == "__main__":
    setup_tables()
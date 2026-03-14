from typing import Optional
from supabase import create_client, Client
from config import settings

_client: Optional[Client] = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        # Use mock database for now until Supabase credentials are fixed
        from services.mock_db import MockSupabaseClient
        _client = MockSupabaseClient()
        # Once Supabase is properly set up, uncomment this:
        # _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client

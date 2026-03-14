from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "AI Learning Platform"
    debug: bool = False

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_anon_key: str

    # Auth
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day
    refresh_token_expire_days: int = 30

    # Anthropic
    anthropic_api_key: str
    anthropic_model: str = "claude-sonnet-4-20250514"
    embedding_model: str = "text-embedding-3-small"

    # OpenAI (for embeddings)
    openai_api_key: str = ""

    # OpenRouter (optional)
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Google Sheets (optional)
    google_service_account_json: str = ""

    # Storage
    max_upload_mb: int = 20

    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields from .env

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

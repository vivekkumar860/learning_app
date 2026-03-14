from typing import Optional
from openai import OpenAI
from config import settings

_client: Optional[OpenAI] = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        # Use OpenRouter's base URL for OpenAI API
        _client = OpenAI(
            api_key=settings.openai_api_key,
            base_url="https://openrouter.ai/api/v1"
        )
    return _client


def embed(text: str) -> list[float]:
    """Return embedding vector for a single text string."""
    response = get_client().embeddings.create(
        model=settings.embedding_model,
        input=text,
    )
    return response.data[0].embedding


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed multiple texts in one API call."""
    response = get_client().embeddings.create(
        model=settings.embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]

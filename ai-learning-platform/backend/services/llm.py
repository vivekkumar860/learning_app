from typing import Optional
import anthropic
from config import settings

_client: Optional[anthropic.Anthropic] = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        # Use OpenRouter's base URL for Anthropic API
        _client = anthropic.Anthropic(
            api_key=settings.anthropic_api_key,
            base_url="https://openrouter.ai/api/v1"
        )
    return _client


def load_prompt(name: str) -> str:
    """Load a prompt template from pipeline/prompts/"""
    import os
    path = os.path.join(os.path.dirname(__file__), "..", "..", "pipeline", "prompts", f"{name}.txt")
    with open(path) as f:
        return f.read()


def chat(system: str, user_message: str, max_tokens: int = 1024) -> str:
    client = get_client()
    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


def stream_chat(system: str, messages: list):
    """Yields text chunks for SSE streaming."""
    client = get_client()
    with client.messages.stream(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=system,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text

"""
Groq LLM client factory with fallback support.
"""
from langchain_groq import ChatGroq
from app.core.config import settings

def get_chat_model(temperature: float = 0.2) -> ChatGroq:
    try:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="openai/gpt-oss-120b",
            temperature=temperature,
            max_retries=2,
        )
    except Exception:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="openai/gpt-oss-120b",
            temperature=temperature,
            max_retries=2,
        )


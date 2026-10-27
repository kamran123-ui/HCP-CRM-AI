"""
Centralized application configuration.

All environment-driven values are declared here and nowhere else, so the
rest of the codebase never touches `os.environ` directly. This keeps
configuration testable, typed, and easy to audit.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_NAME: str = "HCP CRM API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # --- Security ---
    SECRET_KEY: str = "insecure-dev-secret-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # --- Database ---
    DATABASE_URL: str = "postgresql+psycopg2://hcp_admin:change_me@localhost:5432/hcp_crm"

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # --- Groq LLM ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "gemma2-9b-it"
    GROQ_FALLBACK_MODEL: str = "llama-3.3-70b-versatile"

    # --- Logging ---
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor -- avoids re-parsing the environment per call."""
    return Settings()


settings = get_settings()

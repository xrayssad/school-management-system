"""
Application configuration, loaded from environment variables (.env).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Madrasatul Habiib El Mustwafaa El Mustwafaa - School Management System"
    API_V1_PREFIX: str = "/api"

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/postgres"

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "madrasa-uploads"

    SECRET_KEY: str = "insecure-dev-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Either name is accepted. Render was documented as CORS_ORIGINS;
    # older deploys used FRONTEND_ORIGINS. Both are merged.
    CORS_ORIGINS: str = ""
    FRONTEND_ORIGINS: str = "http://localhost:3000,https://madrasatulhabibielmustwafa-2.vercel.app"

    # Optional email (Gmail app password / any SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # Optional WhatsApp via CallMeBot-style URL
    # Example: https://api.callmebot.com/whatsapp.php?phone={phone}&text={text}&apikey=YOUR_KEY
    WHATSAPP_API_URL: str = ""

    PUBLIC_BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        raw = ",".join(part for part in (self.CORS_ORIGINS, self.FRONTEND_ORIGINS) if part)
        seen: list[str] = []
        for origin in raw.split(","):
            origin = origin.strip().rstrip("/")
            if origin and origin not in seen:
                seen.append(origin)
        # Always allow production frontend + local dev
        for must in (
            "http://localhost:3000",
            "https://madrasatulhabibielmustwafa-2.vercel.app",
        ):
            if must not in seen:
                seen.append(must)
        return seen


settings = Settings()

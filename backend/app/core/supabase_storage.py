"""Upload to Supabase Storage public bucket."""
from __future__ import annotations

import uuid
from pathlib import Path

import httpx

from app.core.config import settings


def storage_configured() -> bool:
    return bool(
        (settings.SUPABASE_URL or "").strip()
        and (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()
    )


def public_url(object_path: str) -> str:
    base = settings.SUPABASE_URL.rstrip("/")
    bucket = (settings.SUPABASE_STORAGE_BUCKET or "madrasa-uploads").strip()
    return f"{base}/storage/v1/object/public/{bucket}/{object_path}"


def upload_bytes(
    data: bytes,
    folder: str,
    filename: str,
    content_type: str = "application/octet-stream",
) -> str:
    if not storage_configured():
        raise RuntimeError(
            "SUPABASE_URL au SUPABASE_SERVICE_ROLE_KEY haipo kwenye Render env"
        )
    ext = Path(filename).suffix.lower() or ".bin"
    object_path = f"{folder.strip('/')}/{uuid.uuid4().hex}{ext}"
    bucket = (settings.SUPABASE_STORAGE_BUCKET or "madrasa-uploads").strip()
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{object_path}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    with httpx.Client(timeout=90.0) as client:
        r = client.post(url, content=data, headers=headers)
        if r.status_code not in (200, 201):
            raise RuntimeError(
                f"Supabase upload {r.status_code}: {r.text[:400]}"
            )
    return public_url(object_path)

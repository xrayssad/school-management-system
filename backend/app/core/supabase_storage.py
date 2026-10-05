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


def supabase_base() -> str:
    base = (settings.SUPABASE_URL or "").strip().rstrip("/")
    if not base:
        raise RuntimeError("SUPABASE_URL is empty")
    if not base.startswith("http"):
        base = "https://" + base
    return base


def public_url(object_path: str) -> str:
    """Full public URL — never relative."""
    bucket = (settings.SUPABASE_STORAGE_BUCKET or "madrasa-uploads").strip()
    path = object_path.lstrip("/")
    return f"{supabase_base()}/storage/v1/object/public/{bucket}/{path}"


def normalize_public_url(url: str | None) -> str | None:
    """Fix relative /storage/... URLs already saved in DB."""
    if not url:
        return url
    u = url.strip()
    if u.startswith("http://") or u.startswith("https://"):
        return u
    if u.startswith("/storage/"):
        try:
            return f"{supabase_base()}{u}"
        except Exception:
            return u
    if u.startswith("storage/"):
        try:
            return f"{supabase_base()}/{u}"
        except Exception:
            return u
    return u


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
    upload_endpoint = (
        f"{supabase_base()}/storage/v1/object/{bucket}/{object_path}"
    )
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    with httpx.Client(timeout=90.0) as client:
        r = client.post(upload_endpoint, content=data, headers=headers)
        if r.status_code not in (200, 201):
            raise RuntimeError(
                f"Supabase upload {r.status_code}: {r.text[:400]}"
            )
    full = public_url(object_path)
    # Safety: never return relative
    if not full.startswith("http"):
        raise RuntimeError(f"public_url produced non-http: {full}")
    return full

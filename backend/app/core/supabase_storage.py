from __future__ import annotations
import uuid
from pathlib import Path
import httpx
from app.core.config import settings

FALLBACK_SUPA = "https://cfyscarmbfpfjkvgymxr.supabase.co"

def storage_configured() -> bool:
    return bool((settings.SUPABASE_URL or "").strip() and (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip())

def supabase_base() -> str:
    base = (settings.SUPABASE_URL or FALLBACK_SUPA).strip().rstrip("/")
    if not base.startswith("http"):
        base = "https://" + base
    return base

def public_url(object_path: str) -> str:
    bucket = (settings.SUPABASE_STORAGE_BUCKET or "madrasa-uploads").strip()
    return f"{supabase_base()}/storage/v1/object/public/{bucket}/{object_path.lstrip('/')}"

def normalize_public_url(url: str | None) -> str | None:
    if not url:
        return url
    u = str(url).strip()
    if "onrender.com/storage/" in u:
        return f"{supabase_base()}/storage/" + u.split("/storage/", 1)[1]
    if u.startswith("http://") or u.startswith("https://"):
        return u
    if u.startswith("/storage/"):
        return supabase_base() + u
    if u.startswith("storage/"):
        return supabase_base() + "/" + u
    if u.startswith("/uploads/"):
        # old local — still relative to API (may 404 after redeploy)
        return u
    return u

def upload_bytes(data: bytes, folder: str, filename: str, content_type: str = "application/octet-stream") -> str:
    if not storage_configured():
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing")
    ext = Path(filename).suffix.lower() or ".bin"
    object_path = f"{folder.strip('/')}/{uuid.uuid4().hex}{ext}"
    bucket = (settings.SUPABASE_STORAGE_BUCKET or "madrasa-uploads").strip()
    endpoint = f"{supabase_base()}/storage/v1/object/{bucket}/{object_path}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    with httpx.Client(timeout=90.0) as client:
        r = client.post(endpoint, content=data, headers=headers)
        if r.status_code not in (200, 201):
            raise RuntimeError(f"upload {r.status_code}: {r.text[:300]}")
    return public_url(object_path)

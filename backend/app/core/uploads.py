"""Safe file uploads: size, MIME, extension, UUID filenames."""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.security_limits import (
    ALLOWED_IMAGE_EXT,
    ALLOWED_IMAGE_MIME,
    UPLOAD_MAX_BYTES,
)

# magic bytes
_JPEG = b"\xff\xd8\xff"
_PNG = b"\x89PNG\r\n\x1a\n"
_WEBP_RIFF = b"RIFF"
_WEBP_WEBP = b"WEBP"

# backend/app/core/uploads.py -> backend/app/core -> backend/app -> backend
BACKEND_ROOT = Path(__file__).resolve().parents[2]

# Canonical upload root. Anchored to the backend directory (NOT the process
# CWD) so the StaticFiles mount and every upload writer always agree,
# regardless of the directory uvicorn was started from.
UPLOADS_ROOT = BACKEND_ROOT / "uploads"
UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)


def uploads_dir(*parts: str) -> Path:
    """Return (and create) a subdirectory of the canonical uploads root."""
    d = UPLOADS_ROOT.joinpath(*parts)
    d.mkdir(parents=True, exist_ok=True)
    return d


def _sniff_image(data: bytes) -> str | None:
    if data.startswith(_JPEG):
        return "image/jpeg"
    if data.startswith(_PNG):
        return "image/png"
    if len(data) >= 12 and data[:4] == _WEBP_RIFF and data[8:12] == _WEBP_WEBP:
        return "image/webp"
    return None


def save_image_upload(file: UploadFile, folder: Path, max_bytes: int = UPLOAD_MAX_BYTES) -> str:
    """
    Validate image (extension + MIME sniff + size), save as UUID name.
    Returns public path like /uploads/.../uuid.jpg
    """
    folder.mkdir(parents=True, exist_ok=True)
    raw_name = file.filename or "photo.jpg"
    ext = Path(raw_name).suffix.lower() or ".jpg"
    if ext == ".jpeg":
        ext = ".jpg"
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Picha iwe JPG, PNG au WEBP")

    data = file.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Faili tupu")
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Faili kubwa mno (max {max_bytes // (1024 * 1024)}MB)",
        )

    sniffed = _sniff_image(data)
    if not sniffed or sniffed not in ALLOWED_IMAGE_MIME:
        raise HTTPException(status_code=400, detail="Aina ya faili si picha halali")

    # force extension from sniff
    if sniffed == "image/jpeg":
        ext = ".jpg"
    elif sniffed == "image/png":
        ext = ".png"
    else:
        ext = ".webp"

    name = f"{uuid.uuid4().hex}{ext}"
    dest = folder / name
    dest.write_bytes(data)
    # relative URL path: /uploads/<sub>/<name>
    try:
        rel_dir = folder.resolve().relative_to(UPLOADS_ROOT).parts
    except ValueError:
        parts = folder.parts
        i = parts.index("uploads") if "uploads" in parts else -1
        rel_dir = tuple(parts[i:]) if i >= 0 else ("uploads",)
    return "/" + "/".join(("uploads", *rel_dir, name))

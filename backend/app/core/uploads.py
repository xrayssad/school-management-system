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
    # relative URL path
    # folder often uploads/registrations or uploads/students
    parts = folder.parts
    if "uploads" in parts:
        i = parts.index("uploads")
        rel = "/" + "/".join(parts[i:]) + "/" + name
    else:
        rel = f"/uploads/{name}"
    return rel

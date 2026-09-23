
"""Limits used by upload + rate limit helpers."""
UPLOAD_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}
BCRYPT_ROUNDS = 12
DEFAULT_PAGE_LIMIT = 50
MAX_PAGE_LIMIT = 100

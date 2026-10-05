import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.supabase_storage import (
    storage_configured,
    upload_bytes,
    normalize_public_url,
)

router = APIRouter(prefix="/committee/announcements", tags=["committee-announcements"])
require_committee = require_role(UserRole.committee, UserRole.admin)

ALLOWED = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


def _save_file(file: UploadFile) -> tuple[str, str, str]:
    ext = Path(file.filename or "file.bin").suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Ruhusiwa: PDF, PNG, JPG, WEBP")
    data = file.file.read()
    kind = "pdf" if ext == ".pdf" else "image"
    name = file.filename or f"file{ext}"
    ct = "application/pdf" if ext == ".pdf" else "application/octet-stream"
    if ext in (".jpg", ".jpeg"):
        ct = "image/jpeg"
    elif ext == ".png":
        ct = "image/png"
    elif ext == ".webp":
        ct = "image/webp"
    if not storage_configured():
        raise HTTPException(503, detail="Weka SUPABASE_URL na SUPABASE_SERVICE_ROLE_KEY kwenye Render")
    try:
        url = upload_bytes(data, "announcements", name, ct)
    except Exception as e:
        raise HTTPException(502, detail=f"Storage: {e}") from e
    return url, name, kind


@router.post("/with-attachment")
async def create_with_attachment(
    title: str = Form(...),
    message: str = Form(...),
    audience: str = Form("all"),
    priority: str = Form("normal"),
    attachment: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    att_url = att_name = att_type = None
    if attachment is not None and attachment.filename:
        att_url, att_name, att_type = _save_file(attachment)

    aid = str(uuid.uuid4())
    now = datetime.utcnow()
    for stmt in [
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500)",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255)",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50)",
        "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS audience VARCHAR(50)",
    ]:
        try:
            db.execute(text(stmt))
            db.commit()
        except Exception:
            db.rollback()

    params = {
        "id": aid,
        "title": title,
        "message": message,
        "priority": priority or "normal",
        "audience": audience or "all",
        "url": att_url,
        "aname": att_name,
        "atype": att_type,
        "created_at": now,
    }
    for sql in [
        """INSERT INTO announcements (
            id, title, message, priority, audience,
            attachment_url, attachment_name, attachment_type, created_at
          ) VALUES (
            :id, :title, :message, :priority, :audience,
            :url, :aname, :atype, :created_at
          )""",
        """INSERT INTO announcements (id, title, message, priority, created_at)
           VALUES (:id, :title, :message, :priority, :created_at)""",
    ]:
        try:
            db.execute(text(sql), params)
            db.commit()
            break
        except Exception:
            db.rollback()
    else:
        raise HTTPException(500, detail="Imeshindikana kuhifadhi tangazo")

    return {
        "id": aid,
        "title": title,
        "message": message,
        "priority": priority or "normal",
        "audience": audience or "all",
        "attachment_url": normalize_public_url(att_url),
        "attachment_name": att_name,
        "attachment_type": att_type,
        "created_at": now.isoformat() + "Z",
    }


@router.get("/list")
def list_committee(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    try:
        rows = db.execute(
            text("SELECT * FROM announcements ORDER BY created_at DESC NULLS LAST LIMIT 100")
        ).mappings().all()
    except Exception as e:
        db.rollback()
        raise HTTPException(500, detail=f"list: {e}") from e
    out = []
    for r in rows:
        d = dict(r)
        d["attachment_url"] = normalize_public_url(d.get("attachment_url"))
        out.append(d)
    return out


@router.delete("/{ann_id}")
def delete_announcement(
    ann_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    """Kamati — futa tangazo; haionekani tena kwa wanafunzi wala walimu."""
    row = db.execute(
        text("SELECT id FROM announcements WHERE id = :id"),
        {"id": ann_id},
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Tangazo halipo")
    db.execute(text("DELETE FROM announcements WHERE id = :id"), {"id": ann_id})
    db.commit()
    return {"ok": True, "id": ann_id}


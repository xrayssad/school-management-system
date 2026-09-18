import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/announcements", tags=["committee-announcements"])
require_committee = require_role(UserRole.committee, UserRole.admin)

UPLOAD = Path("uploads/announcements")
UPLOAD.mkdir(parents=True, exist_ok=True)
ALLOWED = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


def _save_file(file: UploadFile) -> tuple[str, str, str]:
    ext = Path(file.filename or "file.bin").suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Ruhusiwa: PDF, PNG, JPG, WEBP")
    name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD / name
    dest.write_bytes(file.file.read())
    kind = "pdf" if ext == ".pdf" else "image"
    return f"/uploads/announcements/{name}", (file.filename or name), kind


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

    # Optional columns (ignore if already exist)
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

    # Full insert — priority NOT NULL + common fields
    attempts = [
        """
        INSERT INTO announcements (
          id, title, message, priority, audience,
          attachment_url, attachment_name, attachment_type, created_at
        ) VALUES (
          :id, :title, :message, :priority, :audience,
          :url, :aname, :atype, :created_at
        )
        """,
        """
        INSERT INTO announcements (
          id, title, message, priority, created_at
        ) VALUES (
          :id, :title, :message, :priority, :created_at
        )
        """,
        """
        INSERT INTO announcements (id, title, message, priority)
        VALUES (:id, :title, :message, :priority)
        """,
    ]
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
    last_err = None
    for sql in attempts:
        try:
            db.execute(text(sql), params)
            db.commit()
            # if minimal insert, try update attachments
            if "attachment_url" not in sql and att_url:
                try:
                    db.execute(
                        text(
                            """
                            UPDATE announcements SET
                              attachment_url = :url,
                              attachment_name = :aname,
                              attachment_type = :atype,
                              audience = :audience
                            WHERE id = :id
                            """
                        ),
                        params,
                    )
                    db.commit()
                except Exception:
                    db.rollback()
            last_err = None
            break
        except Exception as e:
            db.rollback()
            last_err = e
            continue

    if last_err is not None:
        raise HTTPException(status_code=500, detail=f"Insert failed: {last_err}")

    return {
        "id": aid,
        "title": title,
        "message": message,
        "priority": priority or "normal",
        "audience": audience or "all",
        "attachment_url": att_url,
        "attachment_name": att_name,
        "attachment_type": att_type,
    }


@router.get("/list")
def list_committee(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    try:
        rows = db.execute(
            text("SELECT * FROM announcements ORDER BY created_at DESC NULLS LAST LIMIT 100")
        ).mappings().all()
        return [dict(r) for r in rows]
    except Exception:
        db.rollback()
        rows = db.execute(
            text("SELECT id, title, message, priority FROM announcements LIMIT 100")
        ).mappings().all()
        return [dict(r) for r in rows]

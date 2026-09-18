"""Maktaba: vitabu softcopy + past papers."""
from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/library", tags=["library"])
UPLOAD = Path("uploads/library")
UPLOAD.mkdir(parents=True, exist_ok=True)

ALLOWED = {".pdf", ".doc", ".docx", ".epub"}
require_upload = require_role(UserRole.committee, UserRole.admin, UserRole.teacher)


def _save(file: UploadFile) -> tuple[str, str]:
    ext = Path(file.filename or "file.pdf").suffix.lower() or ".pdf"
    if ext not in ALLOWED:
        raise HTTPException(400, detail="Ruhusiwa: PDF, DOC, DOCX, EPUB")
    name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD / name
    dest.write_bytes(file.file.read())
    return f"/uploads/library/{name}", file.filename or name


@router.get("")
def list_items(
    item_type: str | None = None,
    class_name: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Wanafunzi/walimu/kamati — orodha. Mwanafunzi anaweza kuchuja kwa darasa lake."""
    sql = "SELECT * FROM library_items WHERE 1=1"
    params: dict = {}
    if item_type in ("book", "past_paper", "other"):
        sql += " AND item_type = :t"
        params["t"] = item_type
    if class_name:
        sql += " AND (class_name = :cn OR class_name IS NULL OR class_name = '')"
        params["cn"] = class_name
    elif user.role == UserRole.student:
        # default: darasa lake + vitabu vya jumla
        sp = db.execute(
            text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
            {"u": user.id},
        ).first()
        cn = sp[0] if sp else None
        if cn:
            sql += " AND (class_name = :cn OR class_name IS NULL OR class_name = '')"
            params["cn"] = cn
    sql += " ORDER BY created_at DESC NULLS LAST"
    rows = db.execute(text(sql), params).mappings().all()
    return [dict(r) for r in rows]


@router.post("/upload")
async def upload(
    title: str = Form(...),
    item_type: str = Form(...),  # book | past_paper | other
    class_name: str | None = Form(None),
    subject_name: str | None = Form(None),
    term: str | None = Form(None),
    description: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_upload),
):
    if item_type not in ("book", "past_paper", "other"):
        raise HTTPException(400, detail="item_type: book, past_paper au other")
    # vitabu vya darasa: class_name; other/book bila darasa = jumla
    url, fname = _save(file)
    iid = str(uuid.uuid4())
    db.execute(
        text(
            """
            INSERT INTO library_items
              (id, title, description, item_type, class_name, subject_name, term,
               file_url, file_name, uploaded_by_id, created_at)
            VALUES
              (:id, :title, :desc, :it, :cn, :sub, :term, :url, :fn, :uid, :ca)
            """
        ),
        {
            "id": iid,
            "title": title.strip(),
            "desc": description,
            "it": item_type,
            "cn": class_name or None,
            "sub": subject_name,
            "term": term,
            "url": url,
            "fn": fname,
            "uid": user.id,
            "ca": datetime.utcnow(),
        },
    )
    db.commit()
    return {"ok": True, "id": iid, "file_url": url, "title": title}


@router.delete("/{item_id}")
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.committee, UserRole.admin, UserRole.teacher)),
):
    row = db.execute(
        text("SELECT file_url FROM library_items WHERE id = :id"), {"id": item_id}
    ).first()
    if not row:
        raise HTTPException(404, detail="Haipo")
    db.execute(text("DELETE FROM library_items WHERE id = :id"), {"id": item_id})
    db.commit()
    try:
        p = Path(str(row[0]).lstrip("/"))
        if p.exists():
            p.unlink()
    except Exception:
        pass
    return {"ok": True}

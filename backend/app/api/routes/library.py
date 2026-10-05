"""Maktaba: vitabu softcopy + past papers — Supabase Storage."""
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
from app.core.supabase_storage import (
    storage_configured,
    upload_bytes,
    normalize_public_url,
)

router = APIRouter(prefix="/library", tags=["library"])

ALLOWED = {".pdf", ".doc", ".docx", ".epub"}
require_upload = require_role(UserRole.committee, UserRole.admin, UserRole.teacher)
require_delete = require_role(UserRole.committee, UserRole.admin)


def _save(file: UploadFile) -> tuple[str, str]:
    ext = Path(file.filename or "file.pdf").suffix.lower() or ".pdf"
    if ext not in ALLOWED:
        raise HTTPException(400, detail="Ruhusiwa: PDF, DOC, DOCX, EPUB")
    data = file.file.read()
    name = file.filename or f"file{ext}"
    ct = "application/pdf" if ext == ".pdf" else "application/octet-stream"
    if not storage_configured():
        raise HTTPException(
            503,
            detail="Storage haijasanidiwa: SUPABASE_URL / SERVICE_ROLE_KEY kwenye Render",
        )
    try:
        url = upload_bytes(data, "library", name, ct)
    except Exception as e:
        raise HTTPException(502, detail=f"Storage: {e}") from e
    return url, name


@router.get("")
def list_items(
    item_type: str | None = None,
    class_name: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    sql = "SELECT * FROM library_items WHERE 1=1"
    params: dict = {}
    if item_type in ("book", "past_paper", "other"):
        sql += " AND item_type = :t"
        params["t"] = item_type
    if class_name:
        sql += " AND (class_name = :cn OR class_name IS NULL OR class_name = '')"
        params["cn"] = class_name
    elif user.role == UserRole.student:
        sp = db.execute(
            text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
            {"u": user.id},
        ).first()
        cn = sp[0] if sp else None
        if cn:
            sql += " AND (class_name = :cn OR class_name IS NULL OR class_name = '')"
            params["cn"] = cn
    sql += " ORDER BY created_at DESC NULLS LAST"
    try:
        rows = db.execute(text(sql), params).mappings().all()
    except Exception as e:
        db.rollback()
        print("library list:", e)
        return []
    out = []
    for r in rows:
        d = dict(r)
        d["file_url"] = normalize_public_url(d.get("file_url"))
        out.append(d)
    return out


@router.post("/upload")
async def upload(
    title: str = Form(...),
    item_type: str = Form(...),
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
    url, fname = _save(file)
    iid = str(uuid.uuid4())
    try:
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
    except Exception as e:
        db.rollback()
        raise HTTPException(500, detail=f"DB: {e}") from e
    return {"ok": True, "id": iid, "file_url": url, "title": title}


@router.delete("/{item_id}")
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_delete),
):
    """Kamati/admin tu — kufuta huondoa kwa wote."""
    row = db.execute(
        text("SELECT id, file_url FROM library_items WHERE id = :id"),
        {"id": item_id},
    ).mappings().first()
    if not row:
        raise HTTPException(404, detail="Kitabu hakipatikani")
    db.execute(text("DELETE FROM library_items WHERE id = :id"), {"id": item_id})
    db.commit()
    # Faili kwenye Supabase inaweza kubaki; orodha haitalionyesha tena
    return {"ok": True, "id": item_id}

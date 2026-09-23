
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/exam-reports", tags=["exam-reports-public"])

@router.get("/published")
def published(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Kamati, walimu, wanafunzi — orodha ya PDF zilizochapishwa."""
    try:
        rows = db.execute(text(
            "SELECT id, title, report_type, term, file_url, created_at FROM exam_report_files ORDER BY created_at DESC LIMIT 50"
        )).mappings().all()
        return [dict(r) for r in rows]
    except Exception:
        return []

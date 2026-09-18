"""Madarasa rasmi: Maandalizi + Darasa la 1–5."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.classes import CLASS_ORDER, all_classes
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee", tags=["committee-classes"])
require_committee = require_role(UserRole.committee, UserRole.admin)


@router.get("/class-list")
def class_list(_: User = Depends(require_committee)):
    return {"classes": all_classes(), "order": CLASS_ORDER}


@router.get("/classes")
def classes_with_counts(
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    """Orodha rasmi + idadi ya wanafunzi. Hakuna la 6/7."""
    counts = {}
    try:
        for r in db.execute(
            text(
                """
                SELECT sp.class_name, COUNT(*) AS n
                FROM student_profiles sp
                JOIN users u ON u.id = sp.user_id
                WHERE u.role = 'student' AND sp.class_name IS NOT NULL
                GROUP BY sp.class_name
                """
            )
        ):
            counts[r[0]] = r[1]
    except Exception:
        db.rollback()

    out = []
    for cn in CLASS_ORDER:
        out.append(
            {
                "id": cn,
                "name": cn,
                "student_count": int(counts.get(cn) or 0),
            }
        )
    return out

"""Read-only: masomo kwa darasa — consistency kote."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/subjects")
def all_subjects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [
        dict(r)
        for r in db.execute(text("SELECT id, name, code, color FROM subjects ORDER BY name")).mappings()
    ]


@router.get("/class-subjects")
def class_subjects(
    class_name: str | None = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if class_name:
        rows = db.execute(
            text(
                """
                SELECT s.id, s.name, s.code, cs.class_name
                FROM class_subjects cs
                JOIN subjects s ON s.id = cs.subject_id
                WHERE cs.class_name = :c AND cs.is_active = true
                ORDER BY s.name
                """
            ),
            {"c": class_name},
        ).mappings().all()
        return [dict(r) for r in rows]
    # all
    rows = db.execute(
        text(
            """
            SELECT s.id, s.name, s.code, cs.class_name
            FROM class_subjects cs
            JOIN subjects s ON s.id = cs.subject_id
            WHERE cs.is_active = true
            ORDER BY cs.class_name, s.name
            """
        )
    ).mappings().all()
    return [dict(r) for r in rows]

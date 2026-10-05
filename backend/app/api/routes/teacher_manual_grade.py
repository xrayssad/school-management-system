"""Mwalimu — weka alama kwa wanafunzi wa darasa/somo lake."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/teacher", tags=["teacher-grades"])


class MarkIn(BaseModel):
    student_profile_id: str
    marks_obtained: float
    exam_id: str | None = None
    subject_id: str | None = None
    class_name: str | None = None
    remarks: str | None = None


class MarksBatch(BaseModel):
    exam_id: str
    marks: list[MarkIn]


def _letter(marks: float, total: float = 100.0) -> str:
    pct = (marks / total) * 100 if total else 0
    if pct >= 75:
        return "A"
    if pct >= 65:
        return "B"
    if pct >= 50:
        return "C"
    if pct >= 40:
        return "D"
    return "F"


@router.post("/grades/save")
def save_marks(
    body: MarksBatch,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    if not body.exam_id:
        raise HTTPException(400, detail="exam_id inahitajika")
    exam = db.execute(
        text("SELECT id, total_marks, class_name FROM exams WHERE id = :id"),
        {"id": body.exam_id},
    ).mappings().first()
    if not exam:
        raise HTTPException(404, detail="Mtihani haupo")
    total = float(exam["total_marks"] or 100)
    saved = 0
    errors = []
    for m in body.marks:
        try:
            letter = _letter(float(m.marks_obtained), total)
            existing = db.execute(
                text(
                    "SELECT id FROM grades WHERE exam_id = :e AND student_id = :s LIMIT 1"
                ),
                {"e": body.exam_id, "s": m.student_profile_id},
            ).first()
            if existing:
                db.execute(
                    text(
                        """
                        UPDATE grades SET marks_obtained = :m, grade_letter = :g,
                          remarks = :r, graded_at = :ga,
                          status = COALESCE(status, 'submitted')
                        WHERE id = :id
                        """
                    ),
                    {
                        "m": m.marks_obtained,
                        "g": letter,
                        "r": m.remarks or "Manual",
                        "ga": datetime.utcnow(),
                        "id": existing[0],
                    },
                )
            else:
                db.execute(
                    text(
                        """
                        INSERT INTO grades
                          (id, exam_id, student_id, marks_obtained, grade_letter, remarks, graded_at, status)
                        VALUES (:id, :e, :s, :m, :g, :r, :ga, 'submitted')
                        """
                    ),
                    {
                        "id": str(uuid.uuid4()),
                        "e": body.exam_id,
                        "s": m.student_profile_id,
                        "m": m.marks_obtained,
                        "g": letter,
                        "r": m.remarks or "Manual",
                        "ga": datetime.utcnow(),
                    },
                )
            saved += 1
        except Exception as ex:
            db.rollback()
            errors.append(f"{m.student_profile_id}: {ex}")
            continue
    db.commit()
    return {"ok": True, "saved": saved, "errors": errors}


"""Mwalimu: weka alama moja kwa mkono — status=submitted (Kamati ndiyo inachapisha)."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/teacher", tags=["teacher-manual-grade"])
require_teacher = require_role(UserRole.teacher, UserRole.admin)


class ManualGradeIn(BaseModel):
    exam_id: str
    student_code: str = Field(min_length=1)
    marks_obtained: float
    remarks: str | None = None


def _letter(pct: float) -> str:
    if pct >= 75:
        return "A"
    if pct >= 65:
        return "B"
    if pct >= 50:
        return "C"
    if pct >= 40:
        return "D"
    return "F"


@router.post("/exams/{exam_id}/grade-one")
def grade_one(
    exam_id: str,
    body: ManualGradeIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    if body.exam_id != exam_id:
        # allow path id as source of truth
        pass
    eid = exam_id

    exam = db.execute(
        text("SELECT id, teacher_id, class_name, total_marks, title FROM exams WHERE id = :id"),
        {"id": eid},
    ).mappings().first()
    if not exam:
        raise HTTPException(404, detail="Mtihani haupo")

    # optional: verify teacher owns exam
    tid = None
    if getattr(user, "teacher_profile", None):
        tid = user.teacher_profile.id
    else:
        r = db.execute(text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": user.id}).first()
        tid = r[0] if r else None
    if tid and exam["teacher_id"] and exam["teacher_id"] not in (tid, user.id):
        # soft check — still allow admin
        if user.role != UserRole.admin:
            raise HTTPException(403, detail="Si mtihani wako")

    sp = db.execute(
        text(
            """
            SELECT sp.id, sp.class_name, u.full_name
            FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.student_code = :c
            """
        ),
        {"c": body.student_code.strip()},
    ).mappings().first()
    if not sp:
        raise HTTPException(404, detail=f"Namba haipatikani: {body.student_code}")

    if exam["class_name"] and sp["class_name"] and exam["class_name"] != sp["class_name"]:
        raise HTTPException(
            400,
            detail=f"Mwanafunzi yuko {sp['class_name']}, mtihani ni {exam['class_name']}",
        )

    total = float(exam["total_marks"] or 100) or 100
    marks = float(body.marks_obtained)
    if marks < 0 or marks > total:
        raise HTTPException(400, detail=f"Alama 0–{total}")
    pct = (marks / total) * 100.0
    letter = _letter(pct)

    existing = db.execute(
        text("SELECT id FROM grades WHERE exam_id = :e AND student_id = :s"),
        {"e": eid, "s": sp["id"]},
    ).scalar()

    if existing:
        db.execute(
            text(
                """
                UPDATE grades SET
                  marks_obtained = :m,
                  grade_letter = :g,
                  remarks = :r,
                  status = 'submitted',
                  graded_at = :ga,
                  published_at = NULL
                WHERE id = :id
                """
            ),
            {
                "m": marks,
                "g": letter,
                "r": body.remarks or "Manual entry",
                "ga": datetime.utcnow(),
                "id": existing,
            },
        )
        gid = existing
    else:
        gid = str(uuid.uuid4())
        db.execute(
            text(
                """
                INSERT INTO grades
                  (id, exam_id, student_id, marks_obtained, grade_letter, remarks, graded_at, status)
                VALUES (:id, :e, :s, :m, :g, :r, :ga, 'submitted')
                """
            ),
            {
                "id": gid,
                "e": eid,
                "s": sp["id"],
                "m": marks,
                "g": letter,
                "r": body.remarks or "Manual entry",
                "ga": datetime.utcnow(),
            },
        )
    db.commit()
    return {
        "ok": True,
        "grade_id": gid,
        "student_code": body.student_code.strip(),
        "full_name": sp["full_name"],
        "marks_obtained": marks,
        "grade_letter": letter,
        "status": "submitted",
        "note": "Mwanafunzi haoni hadi Kamati ichapishe",
    }


@router.get("/exams/{exam_id}/grades-list")
def list_exam_grades(
    exam_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    """Jedwali la alama za mtihani huu (submitted + published)."""
    exam = db.execute(
        text("""
            SELECT e.id, e.title, e.class_name, e.total_marks, e.teacher_id,
                   s.name AS subject_name
            FROM exams e
            LEFT JOIN subjects s ON s.id = e.subject_id
            WHERE e.id = :id
        """),
        {"id": exam_id},
    ).mappings().first()
    if not exam:
        raise HTTPException(404, detail="Mtihani haupo")

    rows = db.execute(
        text("""
            SELECT g.id, g.marks_obtained, g.grade_letter, g.status, g.remarks, g.graded_at,
                   sp.student_code, u.full_name, sp.class_name
            FROM grades g
            JOIN student_profiles sp ON sp.id = g.student_id
            JOIN users u ON u.id = sp.user_id
            WHERE g.exam_id = :e
            ORDER BY u.full_name
        """),
        {"e": exam_id},
    ).mappings().all()

    return {
        "exam": dict(exam),
        "grades": [dict(r) for r in rows],
        "count": len(rows),
        "submitted": sum(1 for r in rows if (r["status"] or "") == "submitted"),
        "published": sum(1 for r in rows if (r["status"] or "") == "published"),
    }

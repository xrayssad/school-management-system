
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-grades"])


@router.get("/my-grades")
def my_grades(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Matokeo YOTE yaliyochapishwa na Kamati kwa mwanafunzi huyu (hata miaka iliyopita)."""
    if user.role != UserRole.student:
        raise HTTPException(403, "Kwa wanafunzi tu")

    sp = db.execute(
        text("""
            SELECT id, student_code, class_name, promotion_status, promotion_term, promotion_note
            FROM student_profiles WHERE user_id = :u
        """),
        {"u": user.id},
    ).mappings().first()
    if not sp:
        return {"grades": [], "promotion": None}

    pid = sp["id"]
    grades = db.execute(
        text("""
            SELECT g.marks_obtained, g.grade_letter, g.published_at, g.remarks,
                   e.title AS exam_title, e.total_marks, e.class_name, e.exam_date,
                   s.name AS subject_name
            FROM grades g
            JOIN exams e ON e.id = g.exam_id
            LEFT JOIN subjects s ON s.id = e.subject_id
            WHERE g.student_id = :pid
              AND COALESCE(g.status, '') = 'published'
            ORDER BY e.exam_date DESC NULLS LAST, g.published_at DESC NULLS LAST, s.name
        """),
        {"pid": pid},
    ).mappings().all()

    pcts = []
    for g in grades:
        total = float(g["total_marks"] or 100) or 100
        pcts.append(float(g["marks_obtained"] or 0) / total * 100.0)
    average = round(sum(pcts) / len(pcts), 1) if pcts else None

    return {
        "student_code": sp["student_code"],
        "class_name": sp["class_name"],
        "grades": [dict(g) for g in grades],
        "average": average,
        "promotion": {
            "status": sp["promotion_status"],
            "term": sp["promotion_term"],
            "note": sp["promotion_note"],
        },
    }

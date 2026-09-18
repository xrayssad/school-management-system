"""Walimu wa mwanafunzi = ratiba ya Kamati kwa darasa lake tu."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-teachers"])


@router.get("/my-teachers")
def my_teachers(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    sp = db.execute(
        text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).first()
    cn = sp[0] if sp else None
    if not cn:
        return {"class_name": None, "teachers": []}

    rows = db.execute(
        text(
            """
            SELECT DISTINCT
              COALESCE(u1.id, u2.id) AS user_id,
              COALESCE(u1.full_name, u2.full_name) AS full_name,
              COALESCE(u1.email, u2.email) AS email,
              s.name AS subject_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            LEFT JOIN users u1 ON u1.id = c.teacher_id AND u1.role IN ('teacher', 'admin')
            LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
            LEFT JOIN users u2 ON u2.id = tp.user_id
            WHERE c.class_name = :cn
              AND (c.status IS NULL OR c.status::text = 'published')
              AND (u1.id IS NOT NULL OR u2.id IS NOT NULL)
            ORDER BY full_name, subject_name
            """
        ),
        {"cn": cn},
    ).mappings().all()

    by: dict[str, dict] = {}
    for r in rows:
        uid = r["user_id"]
        if not uid:
            continue
        if uid not in by:
            by[uid] = {
                "user_id": uid,
                "full_name": r["full_name"],
                "email": r["email"],
                "subjects": [],
            }
        if r["subject_name"] and r["subject_name"] not in by[uid]["subjects"]:
            by[uid]["subjects"].append(r["subject_name"])

    return {"class_name": cn, "teachers": list(by.values())}

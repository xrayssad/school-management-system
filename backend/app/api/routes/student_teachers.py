"""Walimu wa darasa la mwanafunzi — ratiba + assignments za Kamati."""
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

    by: dict[str, dict] = {}

    # 1) From timetable (published OR draft — student sees planned teachers)
    try:
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
                LEFT JOIN users u1 ON u1.id = c.teacher_id
                LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
                LEFT JOIN users u2 ON u2.id = tp.user_id
                WHERE c.class_name = :cn
                  AND (u1.id IS NOT NULL OR u2.id IS NOT NULL)
                ORDER BY full_name, subject_name
                """
            ),
            {"cn": cn},
        ).mappings().all()
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
            sub = r["subject_name"]
            if sub and sub not in by[uid]["subjects"]:
                by[uid]["subjects"].append(sub)
    except Exception as e:
        print("timetable teachers:", e)

    # 2) From teacher_assignments if table exists
    try:
        rows2 = db.execute(
            text(
                """
                SELECT DISTINCT u.id AS user_id, u.full_name, u.email, s.name AS subject_name
                FROM teacher_assignments ta
                JOIN users u ON (u.id = ta.teacher_id OR u.id = (
                  SELECT user_id FROM teacher_profiles WHERE id = ta.teacher_id LIMIT 1
                ))
                LEFT JOIN subjects s ON s.id = ta.subject_id
                WHERE ta.class_name = :cn AND u.role = 'teacher'
                """
            ),
            {"cn": cn},
        ).mappings().all()
        for r in rows2:
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
            sub = r["subject_name"]
            if sub and sub not in by[uid]["subjects"]:
                by[uid]["subjects"].append(sub)
    except Exception as e:
        print("assignment teachers:", e)

    return {"class_name": cn, "teachers": list(by.values())}

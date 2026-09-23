
"""Mwanafunzi: walimu wa darasa lake kutoka ratiba ya Kamati."""
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
    ).mappings().first()
    if not sp or not sp["class_name"]:
        return {"class_name": None, "teachers": [], "count": 0, "debug_entries": 0}

    cn = sp["class_name"]

    # Include published AND draft (assigned by committee; draft still real assignment)
    rows = db.execute(
        text(
            """
            SELECT
              c.id AS entry_id,
              c.teacher_id,
              c.status,
              s.name AS subject_name,
              u_direct.id AS uid_direct,
              u_direct.full_name AS name_direct,
              u_direct.email AS email_direct,
              u_via.id AS uid_via,
              u_via.full_name AS name_via,
              u_via.email AS email_via
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            LEFT JOIN users u_direct
              ON u_direct.id = c.teacher_id AND u_direct.role IN ('teacher', 'admin')
            LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
            LEFT JOIN users u_via ON u_via.id = tp.user_id
            WHERE c.class_name = :cn
              AND (
                c.status IS NULL
                OR c.status::text IN ('published', 'draft', 'Imechapishwa')
              )
            """
        ),
        {"cn": cn},
    ).mappings().all()

    by: dict = {}
    for r in rows:
        uid = r["uid_direct"] or r["uid_via"]
        name = r["name_direct"] or r["name_via"]
        email = r["email_direct"] or r["email_via"]
        if not uid or not name:
            continue
        by.setdefault(
            uid,
            {"user_id": uid, "full_name": name, "email": email, "subjects": []},
        )
        sub = r["subject_name"]
        if sub and sub not in by[uid]["subjects"]:
            by[uid]["subjects"].append(sub)

    return {
        "class_name": cn,
        "teachers": list(by.values()),
        "count": len(by),
        "debug_entries": len(rows),
    }

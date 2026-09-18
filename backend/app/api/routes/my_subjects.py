
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(tags=["my-subjects"])


def _status_filter(alias: str = "c") -> str:
    return f"(COALESCE({alias}.status, \'published\') IN (\'published\', \'Imechapishwa\') OR {alias}.status IS NULL)"


@router.get("/teacher/my-subjects")
def teacher_my_subjects(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    tid = None
    if getattr(user, "teacher_profile", None):
        tid = user.teacher_profile.id
    else:
        r = db.execute(
            text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": user.id}
        ).first()
        tid = r[0] if r else None

    rows = db.execute(
        text("""
            SELECT DISTINCT c.class_name, s.id AS subject_id, s.name AS subject_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            WHERE (c.teacher_id = :uid OR c.teacher_id = :tid)
              AND c.class_name IS NOT NULL
            ORDER BY c.class_name, s.name
        """),
        {"uid": user.id, "tid": tid or ""},
    ).mappings().all()

    by_class: dict[str, list] = {}
    for r in rows:
        cn = r["class_name"]
        by_class.setdefault(cn, [])
        if r["subject_name"]:
            by_class[cn].append(
                {"subject_id": r["subject_id"], "subject_name": r["subject_name"]}
            )
    return {
        "by_class": [{"class_name": k, "subjects": v} for k, v in sorted(by_class.items())],
        "flat": [dict(r) for r in rows],
    }


@router.get("/student/my-subjects")
def student_my_subjects(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    sp = db.execute(
        text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).first()
    cn = sp[0] if sp else None
    if not cn:
        return {"class_name": None, "subjects": []}
    rows = db.execute(
        text("""
            SELECT DISTINCT s.id AS subject_id, s.name AS subject_name,
                   COALESCE(u1.full_name, u2.full_name) AS teacher_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            LEFT JOIN users u1 ON u1.id = c.teacher_id
            LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
            LEFT JOIN users u2 ON u2.id = tp.user_id
            WHERE c.class_name = :cn AND s.name IS NOT NULL
            ORDER BY s.name
        """),
        {"cn": cn},
    ).mappings().all()
    return {"class_name": cn, "subjects": [dict(r) for r in rows]}

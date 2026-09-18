from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-timetable"])

DAY_NAMES = {
    0: "Jumatatu", 1: "Jumanne", 2: "Jumatano", 3: "Alhamisi",
    4: "Ijumaa", 5: "Jumamosi", 6: "Jumapili",
    "0": "Jumatatu", "1": "Jumanne", "2": "Jumatano", "3": "Alhamisi",
    "4": "Ijumaa", "5": "Jumamosi", "6": "Jumapili",
}


@router.get("/my-timetable")
def my_timetable(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    """Ratiba ya darasa lake pekee — committee_timetable_entries."""
    sp = db.execute(
        text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).first()
    cn = sp[0] if sp else None
    if not cn:
        return {"class_name": None, "entries": []}

    rows = db.execute(
        text("""
            SELECT c.id, c.day_of_week, c.start_time, c.end_time, c.class_name,
                   c.status, s.name AS subject_name,
                   COALESCE(u1.full_name, u2.full_name) AS teacher_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            LEFT JOIN users u1 ON u1.id = c.teacher_id
            LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
            LEFT JOIN users u2 ON u2.id = tp.user_id
            WHERE c.class_name = :cn
            ORDER BY c.day_of_week, c.start_time
        """),
        {"cn": cn},
    ).mappings().all()

    entries = []
    for r in rows:
        d = dict(r)
        dw = d.get("day_of_week")
        d["day_label"] = DAY_NAMES.get(dw, DAY_NAMES.get(str(dw), str(dw)))
        entries.append(d)
    return {"class_name": cn, "entries": entries, "table": "committee_timetable_entries"}

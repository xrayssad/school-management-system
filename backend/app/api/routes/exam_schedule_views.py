"""Ratiba za mitihani — inalingana na columns za exam_schedules zilizopo."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db, engine
from app.models.user import User, UserRole

router = APIRouter(tags=["exam-schedules-view"])


def _cols() -> set[str]:
    try:
        return {c["name"] for c in inspect(engine).get_columns("exam_schedules")}
    except Exception:
        return set()


def _select_sql() -> str:
    c = _cols()
    # base
    parts = ["es.id", "es.class_name"]
    for name in (
        "exam_date",
        "start_time",
        "end_time",
        "room",
        "status",
        "teacher_id",
        "subject_id",
        "term",
        "subject_name",
        "title",
        "notes",
    ):
        if name in c:
            parts.append(f"es.{name}")
    # subject name from join if subject_id exists
    if "subject_id" in c:
        if "subject_name" in c:
            parts.append("COALESCE(es.subject_name, s.name) AS subject_name")
        else:
            parts.append("s.name AS subject_name")
        join = "LEFT JOIN subjects s ON s.id = es.subject_id"
    else:
        join = ""
        if "subject_name" not in c:
            parts.append("NULL::text AS subject_name")
    return ", ".join(parts), join


def _rows(db: Session, where: str, params: dict) -> list[dict]:
    select_list, join = _select_sql()
    c = _cols()
    status_clause = " AND (es.status IS NULL OR es.status::text = 'published')"
    if "status" in c:
        # Postgres enum publish_status: draft | published (si Kiswahili)
        status_clause = " AND (es.status IS NULL OR es.status::text = 'published')"
    order = []
    if "exam_date" in c:
        order.append("es.exam_date NULLS LAST")
    if "start_time" in c:
        order.append("es.start_time NULLS LAST")
    order_sql = (" ORDER BY " + ", ".join(order)) if order else ""
    sql = f"""
        SELECT {select_list}
        FROM exam_schedules es
        {join}
        WHERE ({where}){status_clause}
        {order_sql}
    """
    try:
        return [dict(r) for r in db.execute(text(sql), params).mappings().all()]
    except Exception as e:
        db.rollback()
        raise HTTPException(500, detail=str(e))


@router.get("/student/exam-schedule")
def student_exam_schedule(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    sp = db.execute(
        text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).first()
    if not sp or not sp[0]:
        return {"class_name": None, "entries": []}
    cn = sp[0]
    entries = _rows(db, "es.class_name = :cn", {"cn": cn})
    return {"class_name": cn, "entries": entries}


@router.get("/teacher/exam-schedule")
def teacher_exam_schedule(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    tid = None
    if getattr(user, "teacher_profile", None):
        tid = user.teacher_profile.id
    else:
        row = db.execute(
            text("SELECT id FROM teacher_profiles WHERE user_id = :u"),
            {"u": user.id},
        ).first()
        tid = row[0] if row else None

    classes: set[str] = set()
    try:
        for r in db.execute(
            text(
                """
                SELECT DISTINCT class_name FROM committee_timetable_entries
                WHERE teacher_id = :u OR teacher_id = :t
                """
            ),
            {"u": user.id, "t": tid or ""},
        ):
            if r[0]:
                classes.add(r[0])
    except Exception:
        db.rollback()

    c = _cols()
    params: dict = {"uid": user.id, "tid": tid or ""}
    conditions = []
    if "teacher_id" in c:
        conditions.append("(es.teacher_id = :tid OR es.teacher_id = :uid)")
    if classes:
        ph = []
        for i, cl in enumerate(classes):
            k = f"c{i}"
            ph.append(f":{k}")
            params[k] = cl
        conditions.append(f"es.class_name IN ({', '.join(ph)})")
    if not conditions:
        # no filter keys — return all published for safety empty
        where = "1=0"
    else:
        where = " OR ".join(conditions)

    entries = _rows(db, where, params)
    return {"classes": sorted(classes), "entries": entries}

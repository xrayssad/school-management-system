from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
import json

from app.api.deps import require_role
from app.db.session import get_db, engine
from app.models.user import User, UserRole

router = APIRouter(prefix="/teacher", tags=["teacher-scope"])
require_teacher = require_role(UserRole.teacher, UserRole.admin)

DAY_NAMES = {
    0: "Jumatatu", 1: "Jumanne", 2: "Jumatano", 3: "Alhamisi", 4: "Ijumaa",
    5: "Jumamosi", 6: "Jumapili",
    "Monday": "Jumatatu", "Tuesday": "Jumanne", "Wednesday": "Jumatano",
    "Thursday": "Alhamisi", "Friday": "Ijumaa",
}


def _profile_id(db: Session, user: User):
    if getattr(user, "teacher_profile", None):
        return user.teacher_profile.id
    row = db.execute(text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": user.id}).first()
    return row[0] if row else None


def _parse_list(val) -> list[str]:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(x).strip() for x in val if str(x).strip()]
    if isinstance(val, str):
        s = val.strip()
        if not s:
            return []
        try:
            j = json.loads(s)
            if isinstance(j, list):
                return [str(x).strip() for x in j if str(x).strip()]
        except Exception:
            pass
        if "," in s:
            return [x.strip() for x in s.split(",") if x.strip()]
        return [s]
    return []


def _assigned_classes(db: Session, user: User, tid) -> list[str]:
    """Madarasa YOTE yaliyopangiwa — si ratiba ya siku moja tu."""
    classes: set[str] = set()
    uid = user.id
    tables = set(inspect(engine).get_table_names())

    # A) committee_timetable_entries
    if "committee_timetable_entries" in tables:
        try:
            for r in db.execute(
                text(
                    """
                    SELECT DISTINCT class_name FROM committee_timetable_entries
                    WHERE class_name IS NOT NULL
                      AND (teacher_id = :uid OR teacher_id = :tid)
                    """
                ),
                {"uid": uid, "tid": tid},
            ):
                if r[0]:
                    classes.add(str(r[0]).strip())
        except Exception:
            db.rollback()

    # B) Common assignment tables
    for tbl, col_teacher in [
        ("committee_teacher_assignments", "teacher_id"),
        ("teacher_class_assignments", "teacher_id"),
        ("teacher_classes", "teacher_id"),
        ("committee_teacher_classes", "teacher_id"),
        ("teacher_assignments", "teacher_id"),
    ]:
        if tbl not in tables:
            continue
        cols = {c["name"] for c in inspect(engine).get_columns(tbl)}
        if "class_name" not in cols:
            continue
        try:
            q = f"SELECT DISTINCT class_name FROM {tbl} WHERE {col_teacher} = :uid OR {col_teacher} = :tid"
            for r in db.execute(text(q), {"uid": uid, "tid": tid}):
                if r[0]:
                    classes.add(str(r[0]).strip())
        except Exception:
            db.rollback()

    # C) teacher_profiles JSON / text columns (classes, class_names, assigned_classes)
    if tid and "teacher_profiles" in tables:
        cols = {c["name"] for c in inspect(engine).get_columns("teacher_profiles")}
        for col in ("classes", "class_names", "assigned_classes", "class_list"):
            if col not in cols:
                continue
            try:
                val = db.execute(
                    text(f"SELECT {col} FROM teacher_profiles WHERE id = :t"),
                    {"t": tid},
                ).scalar()
                for c in _parse_list(val):
                    classes.add(c)
            except Exception:
                db.rollback()

    # D) users table extra fields
    cols_u = {c["name"] for c in inspect(engine).get_columns("users")}
    for col in ("classes", "class_names", "assigned_classes"):
        if col in cols_u:
            try:
                val = db.execute(text(f"SELECT {col} FROM users WHERE id = :u"), {"u": uid}).scalar()
                for c in _parse_list(val):
                    classes.add(c)
            except Exception:
                db.rollback()

    # E) exams
    if tid:
        try:
            for r in db.execute(
                text("SELECT DISTINCT class_name FROM exams WHERE teacher_id = :t AND class_name IS NOT NULL"),
                {"t": tid},
            ):
                if r[0]:
                    classes.add(str(r[0]).strip())
        except Exception:
            db.rollback()

    return sorted(classes)


def _assigned_subjects(db: Session, user: User, tid) -> list[dict]:
    found = {}
    uid = user.id
    tables = set(inspect(engine).get_table_names())
    if "committee_timetable_entries" in tables:
        try:
            for r in db.execute(
                text(
                    """
                    SELECT DISTINCT s.id, s.name FROM committee_timetable_entries c
                    JOIN subjects s ON s.id = c.subject_id
                    WHERE c.teacher_id = :uid OR c.teacher_id = :tid
                    """
                ),
                {"uid": uid, "tid": tid},
            ).mappings():
                found[r["id"]] = r["name"]
        except Exception:
            db.rollback()
    if tid and "teacher_subjects" in tables:
        try:
            for r in db.execute(
                text(
                    """
                    SELECT s.id, s.name FROM teacher_subjects ts
                    JOIN subjects s ON s.id = ts.subject_id WHERE ts.teacher_id = :t
                    """
                ),
                {"t": tid},
            ).mappings():
                found[r["id"]] = r["name"]
        except Exception:
            db.rollback()
    if tid and "teacher_profiles" in tables:
        cols = {c["name"] for c in inspect(engine).get_columns("teacher_profiles")}
        for col in ("subjects", "subject_names", "assigned_subjects"):
            if col not in cols:
                continue
            try:
                val = db.execute(text(f"SELECT {col} FROM teacher_profiles WHERE id = :t"), {"t": tid}).scalar()
                for name in _parse_list(val):
                    found[name] = name
            except Exception:
                db.rollback()
    return [{"id": k, "name": v} for k, v in found.items()]


@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    tid = _profile_id(db, user)
    classes = _assigned_classes(db, user, tid)
    subjects = _assigned_subjects(db, user, tid)
    student_count = 0
    if classes:
        student_count = (
            db.execute(
                text(
                    """
                    SELECT COUNT(*) FROM student_profiles sp
                    JOIN users u ON u.id = sp.user_id
                    WHERE u.role = 'student' AND COALESCE(u.is_active, true) = true
                      AND sp.class_name = ANY(:classes)
                    """
                ),
                {"classes": classes},
            ).scalar()
            or 0
        )
    return {
        "student_count": int(student_count),
        "class_count": len(classes),
        "subject_count": len(subjects),
        "classes": classes,
        "subjects": [s["name"] for s in subjects],
    }


@router.get("/my-students")
def my_students(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    tid = _profile_id(db, user)
    classes = _assigned_classes(db, user, tid)
    if not classes:
        return {"classes": [], "students": [], "subjects": _assigned_subjects(db, user, tid), "count": 0}
    students = db.execute(
        text(
            """
            SELECT u.id AS user_id, u.full_name, u.email, u.phone,
                   sp.id AS profile_id, sp.student_code, sp.class_name
            FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE u.role = 'student' AND COALESCE(u.is_active, true) = true
              AND sp.class_name = ANY(:classes)
            ORDER BY sp.class_name, u.full_name
            """
        ),
        {"classes": classes},
    ).mappings().all()
    return {
        "classes": classes,
        "students": [dict(s) for s in students],
        "subjects": _assigned_subjects(db, user, tid),
        "count": len(students),
    }


@router.get("/my-schedule")
def my_schedule(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    """Vipindi VYOTE vya mwalimu (madarasa yote kwenye committee_timetable_entries)."""
    tid = _profile_id(db, user)
    entries = []
    rows = db.execute(
        text(
            """
            SELECT c.id, c.day_of_week, c.start_time, c.end_time, c.class_name, c.status,
                   s.name AS subject_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            WHERE c.teacher_id = :uid OR c.teacher_id = :tid
            ORDER BY c.class_name, c.day_of_week, c.start_time
            """
        ),
        {"uid": user.id, "tid": tid},
    ).mappings().all()
    for r in rows:
        d = dict(r)
        d["day_label"] = DAY_NAMES.get(d.get("day_of_week"), str(d.get("day_of_week")))
        entries.append(d)
    return {
        "entries": entries,
        "classes": _assigned_classes(db, user, tid),
        "by_class": {
            c: [e for e in entries if e.get("class_name") == c]
            for c in sorted({e.get("class_name") for e in entries if e.get("class_name")})
        },
    }

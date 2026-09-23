"""Ratiba/masomo/walimu kutoka committee_timetable_entries."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(tags=["timetable-views"])

STATUS_OK = "(c.status IS NULL OR c.status::text IN ('published', 'draft'))"


def _teacher_ids(db: Session, user: User):
    tid = None
    r = db.execute(
        text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": user.id}
    ).first()
    if r:
        tid = r[0]
    return user.id, tid


@router.get("/teacher/my-schedule")
def teacher_my_schedule(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    uid, tid = _teacher_ids(db, user)
    rows = db.execute(
        text(
            f"""
            SELECT c.id, c.class_name, c.day_of_week, c.start_time, c.end_time,
                   c.status, s.name AS subject_name, s.id AS subject_id
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            WHERE (c.teacher_id = :uid OR c.teacher_id = :tid)
              AND {STATUS_OK}
            ORDER BY
              CASE c.day_of_week
                WHEN 'Jumatatu' THEN 1 WHEN 'Jumanne' THEN 2 WHEN 'Jumatano' THEN 3
                WHEN 'Alhamisi' THEN 4 WHEN 'Ijumaa' THEN 5 WHEN 'Jumamosi' THEN 6
                ELSE 7 END,
              c.start_time NULLS LAST
            """
        ),
        {"uid": uid, "tid": tid or ""},
    ).mappings().all()
    return {
        "teacher_user_id": uid,
        "teacher_profile_id": tid,
        "entries": [dict(r) for r in rows],
        "count": len(rows),
    }


@router.get("/teacher/my-subjects")
def teacher_my_subjects(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    uid, tid = _teacher_ids(db, user)
    rows = db.execute(
        text(
            f"""
            SELECT DISTINCT s.id AS subject_id, s.name AS subject_name, c.class_name
            FROM committee_timetable_entries c
            JOIN subjects s ON s.id = c.subject_id
            WHERE (c.teacher_id = :uid OR c.teacher_id = :tid)
              AND {STATUS_OK}
            ORDER BY c.class_name, s.name
            """
        ),
        {"uid": uid, "tid": tid or ""},
    ).mappings().all()
    # group by subject
    by_subj: dict = {}
    for r in rows:
        sid = r["subject_id"]
        by_subj.setdefault(
            sid,
            {"subject_id": sid, "subject_name": r["subject_name"], "classes": []},
        )
        if r["class_name"] not in by_subj[sid]["classes"]:
            by_subj[sid]["classes"].append(r["class_name"])
    return {"subjects": list(by_subj.values()), "count": len(by_subj)}


@router.get("/student/my-timetable")
def student_my_timetable(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    sp = db.execute(
        text(
            "SELECT class_name FROM student_profiles WHERE user_id = :u"
        ),
        {"u": user.id},
    ).mappings().first()
    if not sp or not sp["class_name"]:
        return {"class_name": None, "entries": []}
    cn = sp["class_name"]
    rows = db.execute(
        text(
            f"""
            SELECT c.id, c.day_of_week, c.start_time, c.end_time, c.class_name, c.status,
                   s.name AS subject_name,
                   COALESCE(u1.full_name, u2.full_name) AS teacher_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            LEFT JOIN users u1 ON u1.id = c.teacher_id
            LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
            LEFT JOIN users u2 ON u2.id = tp.user_id
            WHERE c.class_name = :cn AND {STATUS_OK}
            ORDER BY
              CASE c.day_of_week
                WHEN 'Jumatatu' THEN 1 WHEN 'Jumanne' THEN 2 WHEN 'Jumatano' THEN 3
                WHEN 'Alhamisi' THEN 4 WHEN 'Ijumaa' THEN 5 ELSE 7 END,
              c.start_time NULLS LAST
            """
        ),
        {"cn": cn},
    ).mappings().all()
    return {"class_name": cn, "entries": [dict(r) for r in rows], "count": len(rows)}


@router.get("/student/my-teachers")
def student_my_teachers(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    sp = db.execute(
        text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).mappings().first()
    if not sp or not sp["class_name"]:
        return {"class_name": None, "teachers": []}
    cn = sp["class_name"]
    rows = db.execute(
        text(
            f"""
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
              AND {STATUS_OK}
              AND (u1.id IS NOT NULL OR u2.id IS NOT NULL)
            ORDER BY full_name, subject_name
            """
        ),
        {"cn": cn},
    ).mappings().all()
    # group subjects per teacher
    by: dict = {}
    for r in rows:
        uid = r["user_id"]
        if not uid:
            continue
        by.setdefault(
            uid,
            {
                "user_id": uid,
                "full_name": r["full_name"],
                "email": r["email"],
                "subjects": [],
            },
        )
        if r["subject_name"] and r["subject_name"] not in by[uid]["subjects"]:
            by[uid]["subjects"].append(r["subject_name"])
    return {
        "class_name": cn,
        "teachers": list(by.values()),
        "count": len(by),
    }


@router.get("/student/my-subjects")
def student_my_subjects(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    sp = db.execute(
        text("SELECT class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).mappings().first()
    if not sp or not sp["class_name"]:
        return {"class_name": None, "subjects": []}
    cn = sp["class_name"]
    rows = db.execute(
        text(
            f"""
            SELECT DISTINCT s.id, s.name AS subject_name,
                   COALESCE(u1.full_name, u2.full_name) AS teacher_name
            FROM committee_timetable_entries c
            JOIN subjects s ON s.id = c.subject_id
            LEFT JOIN users u1 ON u1.id = c.teacher_id
            LEFT JOIN teacher_profiles tp ON tp.id = c.teacher_id
            LEFT JOIN users u2 ON u2.id = tp.user_id
            WHERE c.class_name = :cn AND {STATUS_OK}
            ORDER BY s.name
            """
        ),
        {"cn": cn},
    ).mappings().all()
    return {"class_name": cn, "subjects": [dict(r) for r in rows]}

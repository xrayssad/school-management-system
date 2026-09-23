"""Mwalimu: madarasa/masomo anayofundisha + matokeo kwa somo."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/teacher", tags=["teacher-exams-scope"])
require_teacher = require_role(UserRole.teacher, UserRole.admin)


def _teacher_ids(db: Session, user: User) -> tuple[str, str | None]:
    tid = None
    if getattr(user, "teacher_profile", None):
        tid = user.teacher_profile.id
    else:
        r = db.execute(
            text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": user.id}
        ).first()
        tid = r[0] if r else None
    return user.id, tid


def _class_subject_pairs(db: Session, uid: str, tid: str | None):
    """From committee timetable: classes + subjects this teacher teaches."""
    rows = db.execute(
        text(
            """
            SELECT DISTINCT c.class_name, s.id AS subject_id, s.name AS subject_name
            FROM committee_timetable_entries c
            LEFT JOIN subjects s ON s.id = c.subject_id
            WHERE (c.teacher_id = :uid OR c.teacher_id = :tid)
              AND c.class_name IS NOT NULL
              AND s.id IS NOT NULL
            ORDER BY c.class_name, s.name
            """
        ),
        {"uid": uid, "tid": tid or ""},
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/my-teaching-scope")
def my_teaching_scope(
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    uid, tid = _teacher_ids(db, user)
    pairs = _class_subject_pairs(db, uid, tid)
    classes = sorted({p["class_name"] for p in pairs})
    by_class: dict[str, list] = {}
    for p in pairs:
        by_class.setdefault(p["class_name"], []).append(
            {"subject_id": p["subject_id"], "subject_name": p["subject_name"]}
        )
    return {
        "classes": classes,
        "by_class": [
            {"class_name": cn, "subjects": by_class[cn]} for cn in classes
        ],
    }


@router.get("/class-exam-board")
def class_exam_board(
    class_name: str = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    """
    Kwa darasa: masomo anayofundisha mwalimu + exam + wanafunzi + alama.
    """
    uid, tid = _teacher_ids(db, user)
    pairs = [p for p in _class_subject_pairs(db, uid, tid) if p["class_name"] == class_name]
    if not pairs:
        return {"class_name": class_name, "subjects": [], "note": "Hufundishi darasa hili"}

    # students in class
    students = db.execute(
        text(
            """
            SELECT sp.id AS profile_id, sp.student_code, u.full_name
            FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.class_name = :cn AND u.is_active = true
            ORDER BY u.full_name
            """
        ),
        {"cn": class_name},
    ).mappings().all()

    subjects_out = []
    for p in pairs:
        sid = p["subject_id"]
        # find exam for this teacher + class + subject (latest)
        exam = db.execute(
            text(
                """
                SELECT id, title, total_marks, exam_date
                FROM exams
                WHERE class_name = :cn AND subject_id = :sid
                  AND (teacher_id = :tid OR teacher_id = :uid OR teacher_id IS NULL)
                ORDER BY exam_date DESC NULLS LAST, created_at DESC NULLS LAST
                LIMIT 1
                """
            ),
            {"cn": class_name, "sid": sid, "tid": tid or "", "uid": uid},
        ).mappings().first()

        # if no exam, still show subject with empty grades (teacher may need exam created)
        exam_id = exam["id"] if exam else None
        grade_map = {}
        if exam_id:
            for g in db.execute(
                text(
                    """
                    SELECT student_id, marks_obtained, grade_letter, status, id AS grade_id
                    FROM grades WHERE exam_id = :e
                    """
                ),
                {"e": exam_id},
            ).mappings():
                grade_map[g["student_id"]] = dict(g)

        rows = []
        for st in students:
            g = grade_map.get(st["profile_id"])
            rows.append(
                {
                    "profile_id": st["profile_id"],
                    "student_code": st["student_code"],
                    "full_name": st["full_name"],
                    "marks_obtained": g["marks_obtained"] if g else None,
                    "grade_letter": g["grade_letter"] if g else None,
                    "status": g["status"] if g else None,
                    "grade_id": g["grade_id"] if g else None,
                }
            )

        subjects_out.append(
            {
                "subject_id": sid,
                "subject_name": p["subject_name"],
                "exam_id": exam_id,
                "exam_title": exam["title"] if exam else None,
                "total_marks": float(exam["total_marks"]) if exam and exam["total_marks"] else 100,
                "students": rows,
            }
        )

    return {"class_name": class_name, "subjects": subjects_out}


@router.post("/ensure-exam")
def ensure_exam(
    class_name: str = Query(...),
    subject_id: str = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    """Unda mtihani wa somo+darasa ikiwa haupo — ili kuweka alama."""
    import uuid
    from datetime import date, datetime

    uid, tid = _teacher_ids(db, user)
    if not tid:
        raise HTTPException(400, detail="Teacher profile haipo")

    existing = db.execute(
        text(
            """
            SELECT id FROM exams
            WHERE class_name = :cn AND subject_id = :sid AND teacher_id = :tid
            LIMIT 1
            """
        ),
        {"cn": class_name, "sid": subject_id, "tid": tid},
    ).scalar()
    if existing:
        return {"exam_id": existing, "created": False}

    sub_name = db.execute(
        text("SELECT name FROM subjects WHERE id = :id"), {"id": subject_id}
    ).scalar() or "Somo"
    eid = str(uuid.uuid4())
    title = f"{sub_name} · {class_name}"
    db.execute(
        text(
            """
            INSERT INTO exams (id, title, subject_id, teacher_id, class_name, exam_date, total_marks, created_at)
            VALUES (:id, :title, :sid, :tid, :cn, :ed, 100, :ca)
            """
        ),
        {
            "id": eid,
            "title": title,
            "sid": subject_id,
            "tid": tid,
            "cn": class_name,
            "ed": date.today(),
            "ca": datetime.utcnow(),
        },
    )
    db.commit()
    return {"exam_id": eid, "created": True, "title": title}

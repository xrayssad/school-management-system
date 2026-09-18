"""Mwalimu: alama kwa mitihani/masomo/madarasa yake TU."""
from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/teacher/grades", tags=["teacher-grades"])
require_teacher = require_role(UserRole.teacher, UserRole.admin)


def _letter(score: float, scale: dict | None) -> str:
    if scale:
        if score >= float(scale["min_a"]):
            return "A"
        if score >= float(scale["min_b"]):
            return "B"
        if score >= float(scale["min_c"]):
            return "C"
        if score >= float(scale["min_d"]):
            return "D"
        return "F"
    if score >= 75:
        return "A"
    if score >= 65:
        return "B"
    if score >= 50:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def _scale_for(db: Session, class_name: str) -> dict | None:
    row = db.execute(
        text("SELECT * FROM grade_scales WHERE class_name = :c"),
        {"c": class_name},
    ).mappings().first()
    return dict(row) if row else None


def _teacher_profile_id(db: Session, user: User) -> str:
    if getattr(user, "teacher_profile", None):
        return user.teacher_profile.id
    row = db.execute(
        text("SELECT id FROM teacher_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).first()
    if not row:
        raise HTTPException(400, "Hakuna teacher profile")
    return row[0]


def _teacher_subject_ids(db: Session, teacher_profile_id: str) -> set[str]:
    rows = db.execute(
        text("SELECT subject_id FROM teacher_subjects WHERE teacher_id = :t"),
        {"t": teacher_profile_id},
    ).fetchall()
    return {r[0] for r in rows if r[0]}


def _assert_exam_owned(db: Session, exam: dict, teacher_profile_id: str, user: User) -> None:
    if user.role == UserRole.admin:
        return
    if exam.get("teacher_id") != teacher_profile_id:
        raise HTTPException(403, "Si mtihani wako")
    # Lazima somo liwe kwenye masomo anayofundisha (ikiwa teacher_subjects ipo)
    subs = _teacher_subject_ids(db, teacher_profile_id)
    if subs and exam.get("subject_id") and exam["subject_id"] not in subs:
        raise HTTPException(403, "Hufundishi somo hili")


@router.get("/my-scope")
def my_scope(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    """Masomo + madarasa yanayohusiana na mwalimu (kutoka exams + teacher_subjects)."""
    tid = _teacher_profile_id(db, user)
    subjects = [
        dict(r)
        for r in db.execute(
            text(
                """
                SELECT s.id, s.name, s.code
                FROM teacher_subjects ts
                JOIN subjects s ON s.id = ts.subject_id
                WHERE ts.teacher_id = :t
                ORDER BY s.name
                """
            ),
            {"t": tid},
        ).mappings().all()
    ]
    # Madarasa: kutoka mitihani aliyopewa AU distinct class kutoka exams zake
    classes = [
        r[0]
        for r in db.execute(
            text(
                """
                SELECT DISTINCT class_name FROM exams
                WHERE teacher_id = :t AND class_name IS NOT NULL
                ORDER BY class_name
                """
            ),
            {"t": tid},
        ).fetchall()
    ]
    return {"teacher_profile_id": tid, "subjects": subjects, "classes": classes}


@router.get("/my-exams")
def my_exams(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    tid = _teacher_profile_id(db, user)
    subs = _teacher_subject_ids(db, tid)
    # Mitihani: teacher_id = yeye, na (subject yake au subject_id null)
    if subs:
        rows = db.execute(
            text(
                """
                SELECT e.id, e.title, e.class_name, e.exam_date, e.total_marks,
                       e.subject_id, s.name AS subject_name
                FROM exams e
                LEFT JOIN subjects s ON s.id = e.subject_id
                WHERE e.teacher_id = :tid
                  AND (e.subject_id IS NULL OR e.subject_id IN :subs)
                ORDER BY e.exam_date DESC NULLS LAST
                """
            ).bindparams(),
            {"tid": tid},
        )
        # SQLAlchemy IN with set — use expanding
        rows = db.execute(
            text(
                """
                SELECT e.id, e.title, e.class_name, e.exam_date, e.total_marks,
                       e.subject_id, s.name AS subject_name
                FROM exams e
                LEFT JOIN subjects s ON s.id = e.subject_id
                WHERE e.teacher_id = :tid
                  AND (
                    e.subject_id IS NULL
                    OR e.subject_id = ANY(:subs)
                  )
                ORDER BY e.exam_date DESC NULLS LAST
                """
            ),
            {"tid": tid, "subs": list(subs)},
        ).mappings().all()
    else:
        # Hakuna teacher_subjects — tumia exams za teacher_id pekee
        rows = db.execute(
            text(
                """
                SELECT e.id, e.title, e.class_name, e.exam_date, e.total_marks,
                       e.subject_id, s.name AS subject_name
                FROM exams e
                LEFT JOIN subjects s ON s.id = e.subject_id
                WHERE e.teacher_id = :tid
                ORDER BY e.exam_date DESC NULLS LAST
                """
            ),
            {"tid": tid},
        ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/exam/{exam_id}/roster")
def exam_roster(exam_id: str, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    """Wanafunzi WA DARASA LA MITIHANI HUYO TU (sio madarasa yote)."""
    exam = db.execute(text("SELECT * FROM exams WHERE id = :id"), {"id": exam_id}).mappings().first()
    if not exam:
        raise HTTPException(404, "Mtihani haupo")
    exam = dict(exam)
    tid = _teacher_profile_id(db, user)
    _assert_exam_owned(db, exam, tid, user)

    class_name = exam.get("class_name")
    if not class_name:
        raise HTTPException(400, "Mtihani hauna darasa")

    students = db.execute(
        text(
            """
            SELECT sp.id AS profile_id, sp.student_code, sp.class_name,
                   u.full_name, u.id AS user_id
            FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.class_name = :cn
              AND u.is_active = true
              AND u.role = 'student'
            ORDER BY u.full_name
            """
        ),
        {"cn": class_name},
    ).mappings().all()

    grades = {
        r["student_id"]: dict(r)
        for r in db.execute(
            text("SELECT * FROM grades WHERE exam_id = :e"),
            {"e": exam_id},
        ).mappings().all()
    }

    scale = _scale_for(db, class_name)
    roster = []
    for s in students:
        g = grades.get(s["profile_id"])
        roster.append(
            {
                **dict(s),
                "marks_obtained": g.get("marks_obtained") if g else None,
                "grade_letter": g.get("grade_letter") if g else None,
                "status": g.get("status") if g else None,
                "grade_id": g.get("id") if g else None,
            }
        )
    return {
        "exam": {
            "id": exam["id"],
            "title": exam.get("title"),
            "class_name": class_name,
            "subject_id": exam.get("subject_id"),
            "total_marks": exam.get("total_marks") or 100,
        },
        "scale": scale,
        "roster": roster,
        "total_marks": exam.get("total_marks") or 100,
        "scope_note": f"Wanafunzi wa {class_name} pekee",
    }


class MarkIn(BaseModel):
    student_profile_id: str
    marks_obtained: float
    remarks: str | None = None


class BulkMarksIn(BaseModel):
    marks: list[MarkIn]


def _profile_in_exam_class(db: Session, profile_id: str, class_name: str) -> bool:
    row = db.execute(
        text("SELECT 1 FROM student_profiles WHERE id = :id AND class_name = :cn"),
        {"id": profile_id, "cn": class_name},
    ).first()
    return row is not None


@router.post("/exam/{exam_id}/marks")
def save_marks(
    exam_id: str,
    body: BulkMarksIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    exam = db.execute(text("SELECT * FROM exams WHERE id = :id"), {"id": exam_id}).mappings().first()
    if not exam:
        raise HTTPException(404, "Mtihani haupo")
    exam = dict(exam)
    tid = _teacher_profile_id(db, user)
    _assert_exam_owned(db, exam, tid, user)
    class_name = exam["class_name"]
    total = float(exam.get("total_marks") or 100)
    scale = _scale_for(db, class_name)
    saved = 0
    skipped = 0
    for m in body.marks:
        # SECURITY: usikubali profile nje ya darasa la mtihani
        if not _profile_in_exam_class(db, m.student_profile_id, class_name):
            skipped += 1
            continue
        pct = (float(m.marks_obtained) / total) * 100.0 if total else float(m.marks_obtained)
        letter = _letter(pct, scale)
        existing = db.execute(
            text("SELECT id, status FROM grades WHERE exam_id = :e AND student_id = :s"),
            {"e": exam_id, "s": m.student_profile_id},
        ).mappings().first()
        if existing and existing.get("status") == "published":
            skipped += 1
            continue
        if existing:
            db.execute(
                text(
                    """
                    UPDATE grades SET marks_obtained=:m, grade_letter=:g, remarks=:r,
                      status='draft', graded_at=:ga WHERE id=:id
                    """
                ),
                {
                    "m": m.marks_obtained,
                    "g": letter,
                    "r": m.remarks,
                    "ga": datetime.utcnow(),
                    "id": existing["id"],
                },
            )
        else:
            db.execute(
                text(
                    """
                    INSERT INTO grades (id, exam_id, student_id, marks_obtained, grade_letter, remarks, graded_at, status)
                    VALUES (:id,:e,:s,:m,:g,:r,:ga,'draft')
                    """
                ),
                {
                    "id": str(uuid.uuid4()),
                    "e": exam_id,
                    "s": m.student_profile_id,
                    "m": m.marks_obtained,
                    "g": letter,
                    "r": m.remarks,
                    "ga": datetime.utcnow(),
                },
            )
        saved += 1
    db.commit()
    return {"saved": saved, "skipped": skipped}


@router.post("/exam/{exam_id}/submit")
def submit_exam(exam_id: str, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    exam = db.execute(text("SELECT * FROM exams WHERE id = :id"), {"id": exam_id}).mappings().first()
    if not exam:
        raise HTTPException(404, "Mtihani haupo")
    tid = _teacher_profile_id(db, user)
    _assert_exam_owned(db, dict(exam), tid, user)
    n = db.execute(
        text(
            """
            UPDATE grades SET status='submitted', submitted_at=:t
            WHERE exam_id=:e AND status IN ('draft','submitted')
            """
        ),
        {"e": exam_id, "t": datetime.utcnow()},
    ).rowcount
    db.commit()
    return {"submitted": n}


@router.post("/exam/{exam_id}/csv")
async def upload_csv(
    exam_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    exam = db.execute(text("SELECT * FROM exams WHERE id = :id"), {"id": exam_id}).mappings().first()
    if not exam:
        raise HTTPException(404, "Mtihani haupo")
    exam = dict(exam)
    tid = _teacher_profile_id(db, user)
    _assert_exam_owned(db, exam, tid, user)
    class_name = exam["class_name"]
    total = float(exam.get("total_marks") or 100)
    scale = _scale_for(db, class_name)

    raw = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(raw))
    if not reader.fieldnames:
        raise HTTPException(400, "CSV tupu")
    fields = {f.strip().lower(): f for f in reader.fieldnames}
    code_key = fields.get("student_code") or fields.get("namba") or fields.get("code")
    marks_key = fields.get("marks") or fields.get("marks_obtained") or fields.get("alama")
    if not code_key or not marks_key:
        raise HTTPException(400, "CSV: student_code, marks")

    # Profiles YA DARASA HILI TU
    profiles = {
        r["student_code"]: r["id"]
        for r in db.execute(
            text(
                """
                SELECT sp.id, sp.student_code FROM student_profiles sp
                JOIN users u ON u.id = sp.user_id
                WHERE sp.class_name = :c AND u.is_active = true AND u.role = 'student'
                """
            ),
            {"c": class_name},
        ).mappings().all()
        if r.get("student_code")
    }

    saved, errors = 0, []
    for row in reader:
        code = (row.get(code_key) or "").strip()
        try:
            marks_val = float(str(row.get(marks_key) or "").strip())
        except ValueError:
            errors.append(f"{code}: alama si sahihi")
            continue
        pid = profiles.get(code)
        if not pid:
            errors.append(f"{code}: si wa {class_name}")
            continue
        pct = (marks_val / total) * 100.0 if total else marks_val
        letter = _letter(pct, scale)
        existing = db.execute(
            text("SELECT id, status FROM grades WHERE exam_id=:e AND student_id=:s"),
            {"e": exam_id, "s": pid},
        ).mappings().first()
        if existing and existing.get("status") == "published":
            continue
        if existing:
            db.execute(
                text(
                    "UPDATE grades SET marks_obtained=:m, grade_letter=:g, status='draft', graded_at=:ga WHERE id=:id"
                ),
                {"m": marks_val, "g": letter, "ga": datetime.utcnow(), "id": existing["id"]},
            )
        else:
            db.execute(
                text(
                    """
                    INSERT INTO grades (id, exam_id, student_id, marks_obtained, grade_letter, graded_at, status)
                    VALUES (:id,:e,:s,:m,:g,:ga,'draft')
                    """
                ),
                {
                    "id": str(uuid.uuid4()),
                    "e": exam_id,
                    "s": pid,
                    "m": marks_val,
                    "g": letter,
                    "ga": datetime.utcnow(),
                },
            )
        saved += 1
    db.commit()
    return {"saved": saved, "errors": errors[:30], "class_name": class_name}

from __future__ import annotations

import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/teacher", tags=["teacher-grades-csv"])
require_teacher = require_role(UserRole.teacher, UserRole.admin)


def _letter(marks: float, total: float = 100) -> str:
    pct = (marks / (total or 100)) * 100
    if pct >= 75:
        return "A"
    if pct >= 65:
        return "B"
    if pct >= 50:
        return "C"
    if pct >= 40:
        return "D"
    return "F"


def _tid(db: Session, user: User) -> str:
    if getattr(user, "teacher_profile", None):
        return user.teacher_profile.id
    row = db.execute(
        text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": user.id}
    ).first()
    if not row:
        raise HTTPException(400, detail="Hakuna teacher profile")
    return row[0]


@router.get("/my-exams")
def my_exams(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    tid = _tid(db, user)
    rows = db.execute(
        text(
            """
            SELECT e.id, e.title, e.class_name, e.exam_date, e.total_marks,
                   s.name AS subject_name
            FROM exams e
            LEFT JOIN subjects s ON s.id = e.subject_id
            WHERE e.teacher_id = :t
            ORDER BY e.exam_date DESC NULLS LAST, e.title
            """
        ),
        {"t": tid},
    ).mappings().all()
    return [dict(r) for r in rows]


@router.post("/exams/{exam_id}/grades-csv")
async def grades_csv(
    exam_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    """
    CSV: student_code,marks
    Inaandika grades status=submitted (Kamati itachapisha).
    """
    tid = _tid(db, user)
    exam = db.execute(
        text(
            "SELECT id, teacher_id, class_name, total_marks, title FROM exams WHERE id = :id"
        ),
        {"id": exam_id},
    ).mappings().first()
    if not exam:
        raise HTTPException(404, detail="Mtihani haupo")
    if exam["teacher_id"] != tid and user.role != UserRole.admin:
        raise HTTPException(403, detail="Si mtihani wako")

    total = float(exam["total_marks"] or 100)
    raw = await file.read()
    try:
        text_data = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text_data = raw.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text_data))
    if not reader.fieldnames:
        raise HTTPException(400, detail="CSV tupu")

    fields = {((f or "").strip().lower()): f for f in reader.fieldnames}

    def col(*names):
        for n in names:
            if n in fields:
                return fields[n]
        return None

    k_code = col("student_code", "namba", "code")
    k_marks = col("marks", "alama", "score", "marks_obtained")
    if not k_code or not k_marks:
        raise HTTPException(400, detail="CSV iwe na student_code,marks")

    updated, created, errors = 0, 0, []
    for i, row in enumerate(reader, start=2):
        code = (row.get(k_code) or "").strip()
        try:
            marks = float((row.get(k_marks) or "").strip())
        except ValueError:
            errors.append(f"mstari {i}: alama si namba")
            continue
        if not code:
            errors.append(f"mstari {i}: student_code inahitajika")
            continue

        sp = db.execute(
            text(
                """
                SELECT sp.id, sp.class_name FROM student_profiles sp
                WHERE sp.student_code = :c
                """
            ),
            {"c": code},
        ).mappings().first()
        if not sp:
            errors.append(f"{code}: haipo")
            continue
        if exam["class_name"] and sp["class_name"] != exam["class_name"]:
            errors.append(
                f"{code}: darasa {sp['class_name']} ≠ mtihani {exam['class_name']}"
            )
            continue

        letter = _letter(marks, total)
        existing = db.execute(
            text("SELECT id FROM grades WHERE exam_id = :e AND student_id = :s"),
            {"e": exam_id, "s": sp["id"]},
        ).scalar()
        if existing:
            db.execute(
                text(
                    """
                    UPDATE grades SET marks_obtained=:m, grade_letter=:g, status='submitted',
                      remarks='CSV upload', graded_at=:ga
                    WHERE id=:id
                    """
                ),
                {"m": marks, "g": letter, "ga": datetime.utcnow(), "id": existing},
            )
            updated += 1
        else:
            import uuid

            db.execute(
                text(
                    """
                    INSERT INTO grades
                      (id, exam_id, student_id, marks_obtained, grade_letter, remarks, graded_at, status)
                    VALUES
                      (:id, :e, :s, :m, :g, 'CSV upload', :ga, 'submitted')
                    """
                ),
                {
                    "id": str(uuid.uuid4()),
                    "e": exam_id,
                    "s": sp["id"],
                    "m": marks,
                    "g": letter,
                    "ga": datetime.utcnow(),
                },
            )
            created += 1

    db.commit()
    return {
        "ok": True,
        "exam_id": exam_id,
        "exam_title": exam["title"],
        "created": created,
        "updated": updated,
        "errors": errors[:40],
        "note": "Status=submitted — Kamati ichapishe ili mwanafunzi aone.",
    }


@router.get("/exams/{exam_id}/roster")
def exam_roster(exam_id: str, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    tid = _tid(db, user)
    exam = db.execute(
        text("SELECT id, teacher_id, class_name, total_marks, title FROM exams WHERE id=:id"),
        {"id": exam_id},
    ).mappings().first()
    if not exam:
        raise HTTPException(404, detail="Mtihani haupo")
    if exam["teacher_id"] != tid and user.role != UserRole.admin:
        raise HTTPException(403, detail="Si mtihani wako")
    cn = exam["class_name"]
    students = db.execute(
        text("""
            SELECT sp.id AS profile_id, sp.student_code, sp.class_name, u.full_name
            FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.class_name = :cn AND u.is_active = true
            ORDER BY u.full_name
        """),
        {"cn": cn},
    ).mappings().all()
    out = []
    for s in students:
        g = db.execute(
            text("SELECT marks_obtained, grade_letter, status FROM grades WHERE exam_id=:e AND student_id=:p"),
            {"e": exam_id, "p": s["profile_id"]},
        ).mappings().first()
        out.append({
            **dict(s),
            "marks": g["marks_obtained"] if g else None,
            "grade_letter": g["grade_letter"] if g else None,
            "status": g["status"] if g else None,
        })
    return {"exam": dict(exam), "students": out}


@router.post("/exams/submit-marks")
def submit_marks(payload: dict, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    """grades: [{student_code, marks}] — status submitted."""
    from datetime import datetime
    import uuid as _uuid
    exam_id = payload.get("exam_id")
    grades = payload.get("grades") or []
    if not exam_id:
        raise HTTPException(400, detail="exam_id inahitajika")
    tid = _tid(db, user)
    exam = db.execute(
        text("SELECT id, teacher_id, class_name, total_marks FROM exams WHERE id=:id"),
        {"id": exam_id},
    ).mappings().first()
    if not exam or (exam["teacher_id"] != tid and user.role != UserRole.admin):
        raise HTTPException(403, detail="Si mtihani wako")
    total = float(exam["total_marks"] or 100)
    n = 0
    for row in grades:
        code = (row.get("student_code") or "").strip()
        try:
            m = float(row.get("marks"))
        except (TypeError, ValueError):
            continue
        sp = db.execute(
            text("SELECT id FROM student_profiles WHERE student_code=:c"), {"c": code}
        ).scalar()
        if not sp:
            continue
        letter = _letter(m, total)
        existing = db.execute(
            text("SELECT id FROM grades WHERE exam_id=:e AND student_id=:s"),
            {"e": exam_id, "s": sp},
        ).scalar()
        if existing:
            db.execute(
                text("""
                  UPDATE grades SET marks_obtained=:m, grade_letter=:g, status='submitted',
                    graded_at=:ga, remarks='Manual entry'
                  WHERE id=:id
                """),
                {"m": m, "g": letter, "ga": datetime.utcnow(), "id": existing},
            )
        else:
            db.execute(
                text("""
                  INSERT INTO grades (id, exam_id, student_id, marks_obtained, grade_letter, remarks, graded_at, status)
                  VALUES (:id,:e,:s,:m,:g,'Manual entry',:ga,'submitted')
                """),
                {"id": str(_uuid.uuid4()), "e": exam_id, "s": sp, "m": m, "g": letter, "ga": datetime.utcnow()},
            )
        n += 1
    db.commit()
    return {"ok": True, "saved": n, "note": "submitted — Kamati ichapishe"}

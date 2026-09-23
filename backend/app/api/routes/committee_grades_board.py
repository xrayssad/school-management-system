"""Kamati: matokeo kwa darasa/somo — idhinisha (publish) kama CSV."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/grades", tags=["committee-grades-board"])
require_committee = require_role(UserRole.committee, UserRole.admin)


@router.get("/board")
def grades_board(
    class_name: str | None = Query(None),
    status_filter: str | None = Query("submitted"),  # submitted | published | all
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    """
    Matokeo yote: kila mtihani (somo + darasa) na wanafunzi.
    Default: submitted (yanayosubiri kuidhinishwa).
    """
    where = ["1=1"]
    params: dict = {}
    if class_name:
        where.append("e.class_name = :cn")
        params["cn"] = class_name
    if status_filter and status_filter != "all":
        where.append("COALESCE(g.status, 'submitted') = :st")
        params["st"] = status_filter

    rows = db.execute(
        text(f"""
            SELECT g.id AS grade_id, g.marks_obtained, g.grade_letter, g.status,
                   g.remarks, g.graded_at, g.published_at,
                   e.id AS exam_id, e.title AS exam_title, e.class_name, e.total_marks,
                   s.name AS subject_name, s.id AS subject_id,
                   sp.student_code, u.full_name
            FROM grades g
            JOIN exams e ON e.id = g.exam_id
            LEFT JOIN subjects s ON s.id = e.subject_id
            JOIN student_profiles sp ON sp.id = g.student_id
            JOIN users u ON u.id = sp.user_id
            WHERE {' AND '.join(where)}
            ORDER BY e.class_name, s.name, u.full_name
        """),
        params,
    ).mappings().all()

    # group by class -> subject/exam
    by_class: dict = {}
    for r in rows:
        cn = r["class_name"] or "—"
        key = r["exam_id"]
        by_class.setdefault(cn, {})
        if key not in by_class[cn]:
            by_class[cn][key] = {
                "exam_id": r["exam_id"],
                "exam_title": r["exam_title"],
                "subject_name": r["subject_name"],
                "class_name": cn,
                "total_marks": r["total_marks"],
                "grades": [],
            }
        by_class[cn][key]["grades"].append(
            {
                "grade_id": r["grade_id"],
                "student_code": r["student_code"],
                "full_name": r["full_name"],
                "marks_obtained": float(r["marks_obtained"] or 0),
                "grade_letter": r["grade_letter"],
                "status": r["status"],
                "remarks": r["remarks"],
            }
        )

    out = []
    for cn, exams in sorted(by_class.items()):
        out.append(
            {
                "class_name": cn,
                "exams": list(exams.values()),
            }
        )
    return {"status_filter": status_filter, "classes": out, "total_grades": len(rows)}


@router.post("/exam/{exam_id}/publish")
def publish_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    """Chapisha matokeo ya mtihani mmoja (somo + darasa) — kama baada ya CSV."""
    n = db.execute(
        text("""
            UPDATE grades SET
              status = 'published',
              published_at = NOW()
            WHERE exam_id = :e
              AND COALESCE(status, 'submitted') = 'submitted'
        """),
        {"e": exam_id},
    ).rowcount
    db.commit()

    # promotion hook (optional)
    promo = None
    try:
        from app.services.promotion import compute_and_apply
        promo = compute_and_apply(db, term="Muhula 2", apply=True)
    except Exception as e:
        promo = {"error": str(e)}

    return {"ok": True, "published": n or 0, "exam_id": exam_id, "promotion": promo}


@router.post("/publish-all-submitted")
def publish_all(
    class_name: str | None = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    params: dict = {}
    sql = """
        UPDATE grades g
        SET status = 'published', published_at = NOW()
        FROM exams e
        WHERE g.exam_id = e.id
          AND COALESCE(g.status, 'submitted') = 'submitted'
    """
    if class_name:
        sql += " AND e.class_name = :cn"
        params["cn"] = class_name
    n = db.execute(text(sql), params).rowcount
    db.commit()
    promo = None
    try:
        from app.services.promotion import compute_and_apply
        promo = compute_and_apply(db, term="Muhula 2", apply=True)
    except Exception as e:
        promo = {"error": str(e)}
    return {"ok": True, "published": n or 0, "promotion": promo}

"""Mwanafunzi: matokeo yaliyochapishwa — group by year + term."""
from __future__ import annotations

import re
from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-results"])


def _parse_term_year(title: str | None, graded_at, published_at, exam_date):
    t = title or ""
    term = "Muhula 1"
    m = re.search(r"[Mm]uhula\s*([12])", t)
    if m:
        term = f"Muhula {m.group(1)}"
    elif re.search(r"term\s*2|muhula\s*ii", t, re.I):
        term = "Muhula 2"
    elif re.search(r"term\s*1|muhula\s*i\b", t, re.I):
        term = "Muhula 1"

    year = None
    for src in (published_at, graded_at, exam_date):
        if src is not None:
            year = getattr(src, "year", None) or (
                int(str(src)[:4]) if str(src)[:4].isdigit() else None
            )
            if year:
                break
    if not year:
        year = 2026
    return int(year), term


@router.get("/my-results")
def my_results(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    # Base columns only — promotion_* optional (may not exist on DB)
    sp = db.execute(
        text(
            """
            SELECT sp.id, sp.student_code, sp.class_name
            FROM student_profiles sp WHERE sp.user_id = :u
            """
        ),
        {"u": user.id},
    ).mappings().first()

    if not sp:
        return {
            "student_code": None,
            "class_name": None,
            "full_name": user.full_name,
            "promotion": {"status": None, "term": None, "note": None},
            "years": [],
            "overall_average": None,
        }

    promo = {"status": None, "term": None, "note": None}
    try:
        pr = db.execute(
            text(
                """
                SELECT promotion_status, promotion_term, promotion_note
                FROM student_profiles WHERE id = :id
                """
            ),
            {"id": sp["id"]},
        ).mappings().first()
        if pr:
            promo = {
                "status": pr.get("promotion_status"),
                "term": pr.get("promotion_term"),
                "note": pr.get("promotion_note"),
            }
    except Exception:
        db.rollback()

    try:
        rows = db.execute(
            text(
                """
                SELECT
                  g.marks_obtained, g.grade_letter, g.status, g.remarks,
                  g.graded_at, g.published_at,
                  e.title AS exam_title, e.total_marks, e.class_name AS exam_class,
                  e.exam_date, e.id AS exam_id,
                  s.name AS subject_name, s.code AS subject_code
                FROM grades g
                JOIN exams e ON e.id = g.exam_id
                LEFT JOIN subjects s ON s.id = e.subject_id
                WHERE g.student_id = :pid
                  AND (g.status = 'published' OR g.published_at IS NOT NULL)
                ORDER BY COALESCE(g.published_at, g.graded_at, e.exam_date) DESC NULLS LAST
                """
            ),
            {"pid": sp["id"]},
        ).mappings().all()
    except Exception:
        db.rollback()
        rows = db.execute(
            text(
                """
                SELECT
                  g.marks_obtained, g.grade_letter, g.remarks,
                  e.title AS exam_title, e.total_marks, e.class_name AS exam_class,
                  e.exam_date, e.id AS exam_id,
                  s.name AS subject_name, s.code AS subject_code
                FROM grades g
                JOIN exams e ON e.id = g.exam_id
                LEFT JOIN subjects s ON s.id = e.subject_id
                WHERE g.student_id = :pid
                """
            ),
            {"pid": sp["id"]},
        ).mappings().all()

    tree: dict = defaultdict(lambda: defaultdict(list))
    all_marks = []

    for r in rows:
        year, term = _parse_term_year(
            r.get("exam_title"),
            r.get("graded_at"),
            r.get("published_at"),
            r.get("exam_date"),
        )
        total = float(r.get("total_marks") or 100) or 100
        marks = float(r.get("marks_obtained") or 0)
        pct = (marks / total) * 100.0
        all_marks.append(pct)
        tree[year][term].append(
            {
                "subject_code": r.get("subject_code") or "—",
                "subject_name": r.get("subject_name") or r.get("exam_title") or "Somo",
                "exam_title": r.get("exam_title"),
                "exam_class": r.get("exam_class"),
                "marks_obtained": marks,
                "total_marks": total,
                "grade_letter": r.get("grade_letter"),
                "remarks": r.get("remarks"),
                "published_at": (
                    r["published_at"].isoformat()
                    if r.get("published_at") is not None
                    else None
                ),
            }
        )

    years_out = []
    for year in sorted(tree.keys(), reverse=True):
        terms_out = []
        for term in sorted(tree[year].keys()):
            items = tree[year][term]
            avg = sum(
                (i["marks_obtained"] / i["total_marks"]) * 100 for i in items
            ) / len(items)
            terms_out.append(
                {
                    "term": term,
                    "average": round(avg, 1),
                    "count": len(items),
                    "subjects": items,
                }
            )
        years_out.append({"year": year, "terms": terms_out})

    overall = round(sum(all_marks) / len(all_marks), 1) if all_marks else None

    return {
        "student_code": sp["student_code"],
        "class_name": sp["class_name"],
        "full_name": user.full_name,
        "promotion": promo,
        "overall_average": overall,
        "years": years_out,
    }

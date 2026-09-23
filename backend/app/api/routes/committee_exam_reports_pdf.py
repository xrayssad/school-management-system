"""Kamati rankings: SEHEMU 1 bora darasa (#1) | SEHEMU 2 bora somo (#1..#3)."""
from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import datetime
from pathlib import Path as FPath

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

try:
    from app.core.classes import CLASS_ORDER
except Exception:
    CLASS_ORDER = [
        "Maandalizi",
        "Darasa la 1",
        "Darasa la 2",
        "Darasa la 3",
        "Darasa la 4",
        "Darasa la 5",
    ]

router = APIRouter(prefix="/committee/exam-reports", tags=["committee-exam-reports"])
require_committee = require_role(UserRole.committee, UserRole.admin)
UPLOAD = FPath("uploads/reports")
UPLOAD.mkdir(parents=True, exist_ok=True)


def _letter(avg: float) -> str:
    if avg >= 75:
        return "A"
    if avg >= 65:
        return "B"
    if avg >= 50:
        return "C"
    if avg >= 40:
        return "D"
    return "F"


def _class_idx(c: str) -> int:
    try:
        return CLASS_ORDER.index(c)
    except ValueError:
        return 99


def _rows(db: Session, term: str | None):
    params: dict = {}
    term_sql = ""
    if term:
        term_sql = " AND e.title ILIKE :term "
        params["term"] = f"%{term}%"
    return list(
        db.execute(
            text(
                f"""
            SELECT
              sp.id AS profile_id,
              sp.student_code,
              sp.class_name,
              u.full_name,
              s.id AS subject_id,
              s.name AS subject_name,
              s.code AS subject_code,
              g.marks_obtained,
              e.total_marks,
              CASE WHEN e.total_marks > 0
                THEN (g.marks_obtained::float / e.total_marks::float) * 100.0
                ELSE g.marks_obtained::float
              END AS pct
            FROM grades g
            JOIN exams e ON e.id = g.exam_id
            JOIN subjects s ON s.id = e.subject_id
            JOIN student_profiles sp ON sp.id = g.student_id
            JOIN users u ON u.id = sp.user_id
            WHERE (g.status = 'published' OR g.published_at IS NOT NULL)
              {term_sql}
            """
            ),
            params,
        ).mappings()
    )


def section1_best_per_class(rows) -> list[dict]:
    """SEHEMU 1: mmoja tu kwa darasa — wastani wa masomo yote."""
    acc: dict = defaultdict(lambda: {"sum": 0.0, "n": 0, "meta": {}})
    for r in rows:
        k = r["profile_id"]
        acc[k]["sum"] += float(r["pct"] or 0)
        acc[k]["n"] += 1
        acc[k]["meta"] = {
            "full_name": r["full_name"],
            "student_code": r["student_code"],
            "class_name": r["class_name"],
            "profile_id": r["profile_id"],
        }
    best: dict = {}
    for v in acc.values():
        if v["n"] <= 0:
            continue
        avg = v["sum"] / v["n"]
        cn = v["meta"]["class_name"] or ""
        if cn not in best or avg > best[cn]["_avg"]:
            best[cn] = {
                **v["meta"],
                "average": round(avg, 1),
                "letter": _letter(avg),
                "subjects_count": v["n"],
                "rank": 1,
                "note": "Bora #1 — wastani wa masomo yote",
                "_avg": avg,
            }
    out = []
    for cn in CLASS_ORDER:
        if cn in best:
            d = {k: v for k, v in best[cn].items() if k != "_avg"}
            out.append(d)
    for cn, d in best.items():
        if cn not in CLASS_ORDER:
            out.append({k: v for k, v in d.items() if k != "_avg"})
    return out


def section2_best_per_subject(rows, top_n: int = 1) -> list[dict]:
    """SEHEMU 2: hadi #1..#top_n kwa kila (darasa, somo)."""
    buckets: dict = defaultdict(list)
    # best pct per student per subject (if multiple exams, take max)
    per_stu: dict = {}
    for r in rows:
        key = (r["class_name"], r["subject_id"], r["profile_id"])
        pct = float(r["pct"] or 0)
        if key not in per_stu or pct > per_stu[key]["_pct"]:
            per_stu[key] = {
                "class_name": r["class_name"],
                "subject_name": r["subject_name"],
                "subject_code": r["subject_code"],
                "subject_id": r["subject_id"],
                "full_name": r["full_name"],
                "student_code": r["student_code"],
                "marks": r["marks_obtained"],
                "total_marks": r["total_marks"],
                "percent": round(pct, 1),
                "letter": _letter(pct),
                "_pct": pct,
            }
    for v in per_stu.values():
        buckets[(v["class_name"], v["subject_id"], v["subject_name"])].append(v)

    out = []
    for (_cn, _sid, sname), lst in buckets.items():
        lst.sort(key=lambda x: x["_pct"], reverse=True)
        for i, item in enumerate(lst[:top_n], 1):
            d = {k: v for k, v in item.items() if k != "_pct"}
            d["rank"] = i
            d["note"] = f"Bora #{i}"
            out.append(d)
    out.sort(key=lambda x: (_class_idx(x["class_name"] or ""), x["subject_name"] or "", x["rank"]))
    return out


@router.get("/rankings")
def rankings(
    term: str | None = Query(None),
    top_n: int = Query(1, ge=1, le=10),
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    rows = _rows(db, term)
    best_class = section1_best_per_class(rows)
    best_subject = section2_best_per_subject(rows, top_n=top_n)
    school_top1 = max(best_class, key=lambda x: x["average"]) if best_class else None
    return {
        "term": term,
        "section1_title": "Mwanafunzi bora kwa kila darasa (wastani wa masomo yote) — #1 pekee",
        "section2_title": "Mwanafunzi bora kwa kila somo (kwa kila darasa) — #1 pekee",
        "best_per_class": best_class,
        "best_per_subject": best_subject,
        "school_top1": school_top1,
        "class_positions": {
            t["class_name"]: [
                {
                    "rank": 1,
                    "full_name": t["full_name"],
                    "student_code": t["student_code"],
                    "average": t["average"],
                    "letter": t["letter"],
                    "note": t["note"],
                }
            ]
            for t in best_class
        },
        "school_top3": [school_top1] if school_top1 else [],
    }


@router.get("/evaluation")
def evaluation(
    term: str | None = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    rows = _rows(db, term)
    tops = {t["class_name"]: t for t in section1_best_per_class(rows)}
    by_class = []
    for cn in CLASS_ORDER:
        ids = {r["profile_id"] for r in rows if r["class_name"] == cn}
        reg = db.execute(
            text("SELECT COUNT(*) FROM student_profiles WHERE class_name = :c"),
            {"c": cn},
        ).scalar() or 0
        sat = len(ids)
        top = tops.get(cn)
        by_class.append(
            {
                "class_name": cn,
                "registered": int(reg),
                "sat": sat,
                "sat_all": sat,
                "sat_partial": 0,
                "absent": max(int(reg) - sat, 0),
                "top_name": top["full_name"] if top else None,
                "top_avg": top["average"] if top else None,
                "top_letter": top["letter"] if top else None,
                "top_marks": None,
            }
        )
    return {"term": term, "by_class": by_class, "total_students": sum(c["sat"] for c in by_class)}


@router.post("/pdf/evaluation")
def pdf_evaluation(
    term: str = Query("Muhula 2"),
    year: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    year = year or datetime.utcnow().year
    data = evaluation(term=term, db=db, _=user)
    from app.services.tathmini_pdf import build_evaluation_pdf

    pdf = build_evaluation_pdf(term, year, data["by_class"])
    name = f"tathmini_{year}_{uuid.uuid4().hex[:8]}.pdf"
    (UPLOAD / name).write_bytes(pdf)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


@router.post("/pdf/best-students")
def pdf_best(
    term: str = Query("Muhula 2"),
    year: int | None = None,
    top_n: int = Query(1, ge=1, le=10),
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    year = year or datetime.utcnow().year
    data = rankings(term=term, top_n=top_n, db=db, _=user)
    from app.services.tathmini_pdf import build_best_students_pdf

    pdf = build_best_students_pdf(
        term,
        year,
        data["best_per_class"],
        data["school_top1"],
        best_per_subject=data["best_per_subject"],
    )
    name = f"bora_{year}_{uuid.uuid4().hex[:8]}.pdf"
    (UPLOAD / name).write_bytes(pdf)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


# ---------- Manual body PDFs (form on committee UI) ----------
from pydantic import BaseModel, Field
from typing import Any

class EvalClassIn(BaseModel):
    class_name: str
    registered: int = 0
    sat: int = 0
    sat_all: int = 0
    sat_partial: int = 0
    absent: int = 0
    top_name: str | None = None
    top_avg: float | None = None
    top_letter: str | None = None
    top_marks: float | None = None

class EvaluationManualIn(BaseModel):
    term: str = "Muhula 2"
    year: int | None = None
    narrative: str | None = None
    by_class: list[EvalClassIn] = Field(default_factory=list)

class BestClassIn(BaseModel):
    class_name: str
    full_name: str
    student_code: str | None = None
    average: float | None = None
    letter: str | None = None
    note: str | None = None

class BestSubjectIn(BaseModel):
    class_name: str
    subject_name: str
    full_name: str
    student_code: str | None = None
    marks: str | None = None
    note: str | None = None

class BestManualIn(BaseModel):
    term: str = "Muhula 2"
    year: int | None = None
    best_per_class: list[BestClassIn] = Field(default_factory=list)
    best_per_subject: list[BestSubjectIn] = Field(default_factory=list)
    school_top1: BestClassIn | None = None

@router.post("/pdf/evaluation-manual")
def pdf_evaluation_manual(
    body: EvaluationManualIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    year = body.year or datetime.utcnow().year
    by_class = [c.model_dump() for c in body.by_class]
    from app.services.tathmini_pdf import build_evaluation_pdf
    pdf = build_evaluation_pdf(body.term, year, by_class)
    name = f"tathmini_manual_{year}_{uuid.uuid4().hex[:8]}.pdf"
    (UPLOAD / name).write_bytes(pdf)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )

@router.post("/pdf/best-students-manual")
def pdf_best_manual(
    body: BestManualIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    year = body.year or datetime.utcnow().year
    best_class = [c.model_dump() for c in body.best_per_class]
    best_sub = [c.model_dump() for c in body.best_per_subject]
    school = body.school_top1.model_dump() if body.school_top1 else None
    if not school and best_class:
        def avg(x):
            try:
                return float(x.get("average") or 0)
            except Exception:
                return 0
        school = max(best_class, key=avg)
    from app.services.tathmini_pdf import build_best_students_pdf
    pdf = build_best_students_pdf(body.term, year, best_class, school, best_per_subject=best_sub)
    meta = _save_report(db, user, f"Wanafunzi bora — {body.term} {year}", "best_students", body.term, pdf)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="wanafunzi-bora.pdf"',
            "X-Report-Url": meta["file_url"],
        },
    )


# ---- Publish / list so teachers & students can download ----
from sqlalchemy import text as sa_text

def _ensure_report_table(db: Session):
    db.execute(sa_text("""
        CREATE TABLE IF NOT EXISTS exam_report_files (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            report_type VARCHAR(50) NOT NULL,
            term VARCHAR(100),
            file_url VARCHAR(500) NOT NULL,
            created_by_id VARCHAR(36),
            created_at TIMESTAMP DEFAULT NOW()
        )
    """))
    db.commit()

def _save_report(db: Session, user: User, title: str, report_type: str, term: str, pdf: bytes) -> dict:
    _ensure_report_table(db)
    name = f"{report_type}_{uuid.uuid4().hex[:10]}.pdf"
    path = UPLOAD / name
    path.write_bytes(pdf)
    url = f"/uploads/reports/{name}"
    rid = str(uuid.uuid4())
    db.execute(
        sa_text("""
            INSERT INTO exam_report_files (id, title, report_type, term, file_url, created_by_id, created_at)
            VALUES (:id, :title, :rtype, :term, :url, :uid, NOW())
        """),
        {"id": rid, "title": title, "rtype": report_type, "term": term, "url": url, "uid": user.id},
    )
    db.commit()
    return {"id": rid, "title": title, "report_type": report_type, "term": term, "file_url": url}

@router.get("/published")
def list_published_reports(
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    _ensure_report_table(db)
    rows = db.execute(sa_text(
        "SELECT id, title, report_type, term, file_url, created_at FROM exam_report_files ORDER BY created_at DESC LIMIT 50"
    )).mappings().all()
    return [dict(r) for r in rows]


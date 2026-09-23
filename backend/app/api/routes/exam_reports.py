"""
Tathmini ya mitihani, nafasi, bora kwa somo, top 3, promotion rules, PDF.
Inategemea tables: exams, grades (au exam_grades), student_profiles, subjects.
Ikiwa majina yanatofautiana, rekebisha SQL helpers hapa chini.
"""
from __future__ import annotations

import io
import uuid
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session
from reportlab.lib import colors as rl_colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable

from app.api.deps import require_role, get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.exam_policy import ClassPromotionRule, ExamReportFile

router = APIRouter(prefix="/committee/exam-reports", tags=["exam-reports"])
require_committee = require_role(UserRole.committee, UserRole.admin)

REPORTS_DIR = Path("uploads/reports")
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


class PromotionRuleIn(BaseModel):
    class_name: str
    min_average: float = Field(ge=0, le=100)
    fail_grade: str = "D"
    repeat_on_term2_fail: bool = True
    notes: str | None = None


class GeneratePdfIn(BaseModel):
    title: str
    report_type: str  # evaluation | ranking
    term: str | None = None
    exam_id: str | None = None
    publish_announcement: bool = True


def _table_exists(db: Session, name: str) -> bool:
    row = db.execute(
        text("SELECT to_regclass(:n)"),
        {"n": name},
    ).scalar()
    return row is not None



def _fetch_grade_rows(db: Session, term: str | None = None, exam_id: str | None = None):
    """grades.student_id -> student_profiles.id (si users.id)."""
    sql = """
        SELECT
            u.id AS student_id,
            u.full_name AS student_name,
            sp.student_code AS student_code,
            COALESCE(sp.class_name, e.class_name, 'Bila darasa') AS class_name,
            COALESCE(s.name, 'Somo') AS subject_name,
            CASE
                WHEN e.total_marks IS NOT NULL AND e.total_marks > 0
                THEN (g.marks_obtained::float / e.total_marks::float) * 100.0
                ELSE g.marks_obtained::float
            END AS score,
            COALESCE(g.grade_letter, '') AS grade,
            COALESCE(e.title, 'Mtihani') AS exam_title,
            COALESCE(:term, '') AS term
        FROM grades g
        JOIN student_profiles sp ON sp.id = g.student_id
        JOIN users u ON u.id = sp.user_id
        JOIN exams e ON e.id = g.exam_id
        LEFT JOIN subjects s ON s.id = e.subject_id
        WHERE 1=1
          AND (:exam_id IS NULL OR CAST(:exam_id AS text) = '' OR g.exam_id = :exam_id)
          AND (
            :term IS NULL OR CAST(:term AS text) = ''
            OR e.title ILIKE '%%' || :term || '%%'
          )
    """
    params = {"term": term or None, "exam_id": exam_id or None}
    try:
        rows = db.execute(text(sql), params).mappings().all()
        return [dict(r) for r in rows]
    except Exception as ex:
        print("grade query error:", ex)
        db.rollback()
        return []


def _evaluation(rows: list[dict]) -> dict:
    """Idadi: waliosajiliwa (unique students), waliofanya (score not null), waliokosa baadhi."""
    by_class: dict[str, dict] = defaultdict(lambda: {
        "registered": set(),
        "sat_all_subjects": set(),
        "missed_some": set(),
        "subjects": set(),
        "student_subjects": defaultdict(set),
        "student_scored": defaultdict(set),
    })
    for r in rows:
        cn = r.get("class_name") or "Bila darasa"
        sid = r.get("student_id")
        sub = r.get("subject_name") or "?"
        by_class[cn]["registered"].add(sid)
        by_class[cn]["subjects"].add(sub)
        by_class[cn]["student_subjects"][sid].add(sub)
        if r.get("score") is not None:
            by_class[cn]["student_scored"][sid].add(sub)

    out = []
    for cn, data in sorted(by_class.items()):
        registered = len(data["registered"])
        sat = 0
        missed = 0
        for sid in data["registered"]:
            expected = data["student_subjects"][sid] or data["subjects"]
            scored = data["student_scored"][sid]
            if expected and scored >= expected:
                sat += 1
            elif scored:
                missed += 1
            else:
                missed += 1
        out.append({
            "class_name": cn,
            "registered": registered,
            "completed_all": sat,
            "missed_some": missed,
            "subjects_count": len(data["subjects"]),
        })
    return {"by_class": out, "total_students": len({r.get("student_id") for r in rows})}


def _rankings(rows: list[dict]) -> dict:
    # average per student overall + per class; best per subject per class
    scores: dict[str, list] = defaultdict(list)  # student_id -> scores
    meta: dict[str, dict] = {}
    subj_class: dict[tuple, list] = defaultdict(list)  # (class, subject) -> [(sid, name, score)]

    for r in rows:
        if r.get("score") is None:
            continue
        sid = r["student_id"]
        score = float(r["score"])
        scores[sid].append(score)
        meta[sid] = {
            "student_id": sid,
            "student_name": r.get("student_name"),
            "student_code": r.get("student_code"),
            "class_name": r.get("class_name") or "Bila darasa",
        }
        key = (meta[sid]["class_name"], r.get("subject_name") or "?")
        subj_class[key].append((sid, r.get("student_name"), score))

    averages = []
    for sid, sc in scores.items():
        avg = sum(sc) / len(sc) if sc else 0
        averages.append({**meta[sid], "average": round(avg, 2), "subjects_count": len(sc)})

    # school top 3
    school_top = sorted(averages, key=lambda x: x["average"], reverse=True)[:1]

    # positions per class
    by_class: dict[str, list] = defaultdict(list)
    for a in averages:
        by_class[a["class_name"]].append(a)
    class_positions = {}
    for cn, lst in by_class.items():
        ordered = sorted(lst, key=lambda x: x["average"], reverse=True)
        for i, row in enumerate(ordered, 1):
            row = {**row, "position": i}
            ordered[i - 1] = row
        class_positions[cn] = ordered

    # best student per subject per class
    best_per_subject = []
    for (cn, sub), lst in subj_class.items():
        best = max(lst, key=lambda x: x[2])
        best_per_subject.append({
            "class_name": cn,
            "subject_name": sub,
            "student_id": best[0],
            "student_name": best[1],
            "score": best[2],
        })
    best_per_subject.sort(key=lambda x: (x["class_name"], x["subject_name"]))

    return {
        "class_positions": class_positions,
        "best_per_subject": best_per_subject,
        "school_top1": school_top,
    }


def _grade_letter(score: float) -> str:
    if score >= 75:
        return "A"
    if score >= 65:
        return "B"
    if score >= 50:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def _promotion_preview(db: Session, rows: list[dict], term: str | None) -> list[dict]:
    """Term 2 + grade D / chini ya wastani → kurudishwa."""
    rules = {r.class_name: r for r in db.query(ClassPromotionRule).all()}
    rankings = _rankings(rows)
    results = []
    is_term2 = (term or "").lower() in ("2", "term 2", "term2", "muhula wa 2", "second")

    # student subject grades
    stud_grades: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        if r.get("score") is None:
            continue
        g = (r.get("grade") or "").strip().upper() or _grade_letter(float(r["score"]))
        stud_grades[r["student_id"]].append(g)

    for cn, ordered in rankings["class_positions"].items():
        rule = rules.get(cn)
        min_avg = rule.min_average if rule else 40.0
        fail_g = (rule.fail_grade if rule else "D").upper()
        repeat_t2 = rule.repeat_on_term2_fail if rule else True
        for row in ordered:
            grades = stud_grades.get(row["student_id"], [])
            has_fail = fail_g in grades or any(g in ("F", "E") for g in grades)
            avg = row["average"]
            decision = "pandishwa"
            reason = f"Wastani {avg} ≥ {min_avg}"
            if avg < min_avg:
                decision = "kurudishwa"
                reason = f"Wastani {avg} < {min_avg}"
            if is_term2 and repeat_t2 and has_fail:
                decision = "kurudishwa"
                reason = f"Term 2: grade {fail_g}/F kwenye somo"
            results.append({**row, "decision": decision, "reason": reason, "term": term})
    return results



def _build_pdf(title: str, lines: list[list[str]], subtitle: str = "", extra_note: str = "") -> Path:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4, title=title,
        leftMargin=40, rightMargin=40, topMargin=36, bottomMargin=36,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "T", parent=styles["Title"], fontSize=14, textColor=rl_colors.HexColor("#18453B"), spaceAfter=4,
    )
    sub_style = ParagraphStyle(
        "S", parent=styles["Normal"], fontSize=9, textColor=rl_colors.HexColor("#4A554F"), spaceAfter=2,
    )
    story = []
    logo_path = Path("uploads/logo.jpg")
    if logo_path.exists():
        try:
            img = RLImage(str(logo_path), width=48, height=48)
            story.append(img)
            story.append(Spacer(1, 6))
        except Exception:
            pass
    story.append(Paragraph("Madrasatul Habiib El Mustwafaa El Mustwafaa", title_style))
    story.append(Paragraph("Kigorofani, Zanzibar — Portali ya Madrasa", sub_style))
    story.append(Paragraph(title, ParagraphStyle("H", parent=styles["Heading2"], fontSize=12, textColor=rl_colors.HexColor("#0F2F28"))))
    story.append(Paragraph(subtitle or datetime.utcnow().strftime("%Y-%m-%d"), sub_style))
    if extra_note:
        story.append(Paragraph(extra_note, sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=rl_colors.HexColor("#18453B")))
    story.append(Spacer(1, 10))
    if lines:
        table = Table(lines, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), rl_colors.HexColor("#18453B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), rl_colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.3, rl_colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [rl_colors.white, rl_colors.HexColor("#F0F5F2")]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(table)
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Hati hii imetolewa na Uongozi wa Kamati ya Madrasatul Habiib El Mustwafaa El Mustwafaa. "
        "Kwa maswali wasiliana na ofisi ya madrasa.",
        sub_style,
    ))
    doc.build(story)
    name = f"{uuid.uuid4().hex}.pdf"
    path = REPORTS_DIR / name
    path.write_bytes(buf.getvalue())
    return path



@router.get("/evaluation")
def evaluation(
    term: str | None = None,
    exam_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    rows = _fetch_grade_rows(db, term=term, exam_id=exam_id)
    return {"rows_count": len(rows), **_evaluation(rows)}


@router.get("/rankings")
def rankings(
    term: str | None = None,
    exam_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    rows = _fetch_grade_rows(db, term=term, exam_id=exam_id)
    return _rankings(rows)


@router.get("/promotion-preview")
def promotion_preview(
    term: str | None = None,
    exam_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    rows = _fetch_grade_rows(db, term=term, exam_id=exam_id)
    return {"items": _promotion_preview(db, rows, term)}


@router.get("/promotion-rules")
def list_rules(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    return db.query(ClassPromotionRule).order_by(ClassPromotionRule.class_name).all()


@router.put("/promotion-rules")
def upsert_rule(body: PromotionRuleIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = db.query(ClassPromotionRule).filter(ClassPromotionRule.class_name == body.class_name).first()
    if not row:
        row = ClassPromotionRule(class_name=body.class_name)
        db.add(row)
    row.min_average = body.min_average
    row.fail_grade = body.fail_grade.upper()
    row.repeat_on_term2_fail = body.repeat_on_term2_fail
    row.notes = body.notes
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row



@router.post("/generate-pdf")
def generate_pdf(
    body: GeneratePdfIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    rows = _fetch_grade_rows(db, term=body.term, exam_id=body.exam_id)
    term = (body.term or "").strip()

    if body.report_type == "evaluation":
        lines = [["Darasa", "Waliosajiliwa", "Wamekamilisha", "Wamekosa baadhi", "Maelezo"]]
        manual_rows = []
        if term:
            manual_rows = (
                db.query(ManualExamEvaluation)
                .filter(ManualExamEvaluation.term == term)
                .order_by(ManualExamEvaluation.class_name)
                .all()
            )
        if manual_rows:
            for c in manual_rows:
                lines.append([
                    c.class_name,
                    str(c.registered),
                    str(c.completed_all),
                    str(c.missed_some),
                    (c.notes or "—"),
                ])
        else:
            ev = _evaluation(rows)
            for c in ev["by_class"]:
                lines.append([
                    c["class_name"],
                    str(c["registered"]),
                    str(c["completed_all"]),
                    str(c["missed_some"]),
                    str(c.get("subjects_count", "")),
                ])
            if len(lines) == 1:
                lines.append(["—", "0", "0", "0", "Hakuna data (weka tathmini kwa mkono)"])
        path = _build_pdf(
            body.title,
            lines,
            subtitle=f"Muhula: {term or '—'} · Tarehe: {datetime.utcnow().strftime('%Y-%m-%d')}",
            extra_note="Ripoti ya tathmini ya mitihani kwa kila darasa (waliosajiliwa, waliofanya, waliokosa).",
        )

    elif body.report_type == "ranking":
        lines = [["Nafasi", "Jina", "Namba", "Darasa", "Wastani / Alama"]]
        rk = _rankings(rows)

        # class positions from auto if any
        for cn, lst in (rk.get("class_positions") or {}).items():
            for row in lst[:25]:
                lines.append([
                    str(row.get("position", "")),
                    row.get("student_name") or "",
                    row.get("student_code") or "",
                    cn,
                    str(row.get("average", "")),
                ])

        lines.append(["", "", "", "", ""])
        lines.append(["TOP 3 CHUO NZIMA", "", "", "", ""])
        tops = []
        if term:
            tops = (
                db.query(ManualSchoolTop)
                .filter(ManualSchoolTop.term == term)
                .order_by(ManualSchoolTop.position)
                .all()
            )
        if tops:
            for row in tops:
                lines.append([
                    str(row.position),
                    row.student_name,
                    row.student_code or "",
                    row.class_name,
                    str(row.average),
                ])
        else:
            for i, row in enumerate(rk.get("school_top1") or [], 1):
                lines.append([
                    str(i),
                    row.get("student_name") or "",
                    row.get("student_code") or "",
                    row.get("class_name") or "",
                    str(row.get("average", "")),
                ])

        lines.append(["", "", "", "", ""])
        
        lines.append(["", "", "", "", ""])
        lines.append(["BORA WA DARASA (WASTANI — SI SOMO)", "", "", "", ""])
        lines.append(["Darasa", "Nafasi", "Mwanafunzi", "Namba", "Wastani"])
        class_bests = []
        if term:
            class_bests = (
                db.query(ManualClassBest)
                .filter(ManualClassBest.term == term)
                .order_by(ManualClassBest.class_name, ManualClassBest.position)
                .all()
            )
        if class_bests:
            for b in class_bests:
                lines.append([
                    b.class_name,
                    str(b.position),
                    b.student_name,
                    b.student_code or "",
                    str(b.average),
                ])
        else:
            # auto: #1 only (highest average) per class
            for cn, lst in (rk.get("class_positions") or {}).items():
                if not lst:
                    continue
                row = lst[0]  # already sorted by average desc
                lines.append([
                    cn,
                    "1",
                    row.get("student_name") or "",
                    row.get("student_code") or "",
                    str(row.get("average", "")),
                ])

        lines.append(["", "", "", "", ""])
        lines.append(["MWANAFUNZI BORA KWA SOMO (KILA DARASA)", "", "", "", ""])

        lines.append(["MWANAFUNZI BORA KWA SOMO NA DARASA", "", "", "", ""])
        lines.append(["Darasa", "Somo", "Mwanafunzi", "Namba", "Alama / Note"])
        bests = []
        if term:
            bests = (
                db.query(ManualBestStudent)
                .filter(ManualBestStudent.term == term)
                .order_by(ManualBestStudent.class_name, ManualBestStudent.subject_name, ManualBestStudent.notes)
                .all()
            )
        if bests:
            for b in bests:
                note = b.notes or ""
                score = "" if b.score is None else str(b.score)
                lines.append([
                    b.class_name,
                    b.subject_name,
                    b.student_name,
                    b.student_code or "",
                    f"{score} {note}".strip(),
                ])
        else:
            for b in rk.get("best_per_subject") or []:
                lines.append([
                    b.get("class_name") or "",
                    b.get("subject_name") or "",
                    b.get("student_name") or "",
                    "",
                    str(b.get("score", "")),
                ])

        if len(lines) < 5:
            lines.append(["—", "—", "Hakuna data", "—", "Weka bora/top kwa mkono"])

        path = _build_pdf(
            body.title,
            lines,
            subtitle=f"Muhula: {term or '—'} · Tarehe: {datetime.utcnow().strftime('%Y-%m-%d')}",
            extra_note="Nafasi, wanafunzi bora (#1, #2) kwa somo/darasa, na Top 3 wa chuo.",
        )
    else:
        raise HTTPException(status_code=400, detail="report_type: evaluation | ranking")

    file_url = f"/uploads/reports/{path.name}"
    rec = ExamReportFile(
        title=body.title,
        report_type=body.report_type,
        exam_id=body.exam_id,
        term=term or None,
        file_url=file_url,
        created_by_id=current.id,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"id": rec.id, "file_url": file_url, "title": rec.title, "term": rec.term}



@router.get("/files")
def list_files(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Kamati, walimu, wanafunzi wanaweza kuona orodha
    return db.query(ExamReportFile).order_by(ExamReportFile.created_at.desc()).limit(50).all()


# ----- Manual data (Kamati) -----
from app.models.exam_policy import ManualExamEvaluation, ManualBestStudent, ManualSchoolTop, ManualClassBest

class ManualEvalIn(BaseModel):
    term: str
    class_name: str
    registered: int = 0
    completed_all: int = 0
    missed_some: int = 0
    notes: str | None = None

class ManualBestIn(BaseModel):
    term: str
    class_name: str
    subject_name: str
    student_name: str
    student_code: str | None = None
    score: float | None = None
    notes: str | None = None

class ManualTopIn(BaseModel):
    term: str
    position: int
    student_name: str
    student_code: str | None = None
    class_name: str
    average: float = 0

@router.get("/manual/evaluation")
def get_manual_eval(term: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    return db.query(ManualExamEvaluation).filter(ManualExamEvaluation.term == term).order_by(ManualExamEvaluation.class_name).all()

@router.post("/manual/evaluation")
def upsert_manual_eval(body: ManualEvalIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = (
        db.query(ManualExamEvaluation)
        .filter(ManualExamEvaluation.term == body.term, ManualExamEvaluation.class_name == body.class_name)
        .first()
    )
    if not row:
        row = ManualExamEvaluation(term=body.term, class_name=body.class_name)
        db.add(row)
    row.registered = body.registered
    row.completed_all = body.completed_all
    row.missed_some = body.missed_some
    row.notes = body.notes
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row

@router.get("/manual/best")
def get_manual_best(term: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    return db.query(ManualBestStudent).filter(ManualBestStudent.term == term).order_by(ManualBestStudent.class_name, ManualBestStudent.subject_name).all()

@router.post("/manual/best")
def add_manual_best(body: ManualBestIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = ManualBestStudent(
        term=body.term, class_name=body.class_name, subject_name=body.subject_name,
        student_name=body.student_name, student_code=body.student_code, score=body.score, notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.delete("/manual/best/{item_id}")
def del_manual_best(item_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = db.get(ManualBestStudent, item_id)
    if row:
        db.delete(row)
        db.commit()
    return {"ok": True}

@router.get("/manual/top")
def get_manual_top(term: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    return db.query(ManualSchoolTop).filter(ManualSchoolTop.term == term).order_by(ManualSchoolTop.position).all()

@router.post("/manual/top")
def upsert_manual_top(body: ManualTopIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = (
        db.query(ManualSchoolTop)
        .filter(ManualSchoolTop.term == body.term, ManualSchoolTop.position == body.position)
        .first()
    )
    if not row:
        row = ManualSchoolTop(term=body.term, position=body.position)
        db.add(row)
    row.student_name = body.student_name
    row.student_code = body.student_code
    row.class_name = body.class_name
    row.average = body.average
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row

@router.get("/download/{file_id}")
def download_report(file_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Wanafunzi, walimu, kamati wanaweza kupakua."""
    rec = db.get(ExamReportFile, file_id)
    if not rec:
        raise HTTPException(404, "Faili halipo")
    path = Path("uploads/reports") / Path(rec.file_url).name
    if not path.exists():
        raise HTTPException(404, "PDF haipo kwenye server")
    return FileResponse(path, media_type="application/pdf", filename=f"{rec.title}.pdf")


class ManualClassBestIn(BaseModel):
    term: str
    class_name: str
    position: int = 1
    student_name: str
    student_code: str | None = None
    average: float = 0
    notes: str | None = None

@router.get("/manual/class-best")
def get_class_best(term: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    return (
        db.query(ManualClassBest)
        .filter(ManualClassBest.term == term)
        .order_by(ManualClassBest.class_name, ManualClassBest.position)
        .all()
    )

@router.post("/manual/class-best")
def upsert_class_best(body: ManualClassBestIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = (
        db.query(ManualClassBest)
        .filter(
            ManualClassBest.term == body.term,
            ManualClassBest.class_name == body.class_name,
            ManualClassBest.position == body.position,
        )
        .first()
    )
    if not row:
        row = ManualClassBest(term=body.term, class_name=body.class_name, position=body.position)
        db.add(row)
    row.student_name = body.student_name
    row.student_code = body.student_code
    row.average = body.average
    row.notes = body.notes
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row

@router.delete("/manual/class-best/{item_id}")
def del_class_best(item_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = db.get(ManualClassBest, item_id)
    if row:
        db.delete(row)
        db.commit()
    return {"ok": True}

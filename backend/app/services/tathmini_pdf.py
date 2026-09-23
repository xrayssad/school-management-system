from __future__ import annotations

import io
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

HAS_RL = True
SCHOOL = "Madrasatul Habiib El Mustwafaa"
TAGLINE = "Kigorofani, Zanzibar"
MOTTO = "ELIMU NDIO URITHI BORA KWA MTOTO WAKO"
PRIMARY = colors.HexColor("#18453B")
LINE = colors.HexColor("#C5D4CC")
HEADER_BG = colors.HexColor("#E4EFE9")


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "t", parent=base["Heading1"], fontSize=13, alignment=TA_CENTER,
            textColor=PRIMARY, spaceAfter=6, fontName="Helvetica-Bold",
        ),
        "school": ParagraphStyle(
            "s", parent=base["Normal"], fontSize=12, alignment=TA_CENTER,
            textColor=PRIMARY, fontName="Helvetica-Bold", spaceAfter=2,
        ),
        "sub": ParagraphStyle(
            "sub", parent=base["Normal"], fontSize=9, alignment=TA_CENTER,
            textColor=colors.HexColor("#4A554F"), spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontSize=11, textColor=PRIMARY,
            fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "b", parent=base["Normal"], fontSize=9, leading=13, alignment=TA_LEFT, spaceAfter=6,
        ),
        "motto": ParagraphStyle(
            "m", parent=base["Normal"], fontSize=8, alignment=TA_CENTER,
            textColor=PRIMARY, fontName="Helvetica-Oblique", spaceBefore=14,
        ),
    }


def _header(story, st, subtitle: str):
    story.append(Paragraph(SCHOOL, st["school"]))
    story.append(Paragraph(TAGLINE, st["sub"]))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))
    story.append(Paragraph(subtitle, st["title"]))


def _table(data, col_widths=None):
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
                ("TEXTCOLOR", (0, 0), (-1, 0), PRIMARY),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAF9")]),
            ]
        )
    )
    return t


def build_evaluation_pdf(term, year, by_class, narrative=None):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4, leftMargin=1.5 * cm, rightMargin=1.5 * cm, topMargin=1.2 * cm, bottomMargin=1.2 * cm
    )
    st = _styles()
    story = []
    _header(story, st, "TATHMINI FUPI YA MITIHANI")
    if narrative:
        story.append(Paragraph(narrative, st["body"]))
    else:
        story.append(Paragraph(f"Mitihani ya {term}, mwaka {year}.", st["body"]))
    story.append(Paragraph("IDADI YA WATAHINIWA", st["h2"]))
    classes = [c.get("class_name") or "" for c in by_class]
    header = ["NA."] + classes + ["JUMLA"]

    def row(label, key):
        vals = [c.get(key, 0) or 0 for c in by_class]
        total = sum(int(v) if isinstance(v, (int, float)) else 0 for v in vals)
        return [label] + [str(v) for v in vals] + [str(total)]

    data = [
        header,
        row("WALIOSAJILIWA KUFANYA", "registered"),
        row("WALIOFANYA", "sat"),
        row("WALIOFANYA YOTE", "sat_all"),
        row("WAMEFANYA BAADHI", "sat_partial"),
        row("HAWAKUFANYA KABISA", "absent"),
    ]
    story.append(_table(data))
    story.append(Paragraph(MOTTO, st["motto"]))
    doc.build(story)
    return buf.getvalue()


def build_best_students_pdf(term, year, per_class_top1, school_top1=None, best_per_subject=None):
    """SEHEMU 1 always. SEHEMU 2 only if best_per_subject has rows. No MAELEZO column."""
    best_per_subject = [r for r in (best_per_subject or []) if (r.get("full_name") or "").strip()]
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4, leftMargin=1.5 * cm, rightMargin=1.5 * cm, topMargin=1.2 * cm, bottomMargin=1.2 * cm
    )
    st = _styles()
    story = []
    _header(story, st, f"WANAFUNZI BORA — {term} {year}")

    story.append(Paragraph("SEHEMU 1: BORA KWA KILA DARASA", st["h2"]))
    story.append(
        Paragraph("Mwanafunzi mmoja tu (#1) mwenye wastani wa juu wa masomo yote katika darasa lake.", st["body"])
    )
    # NO MAELEZO column
    data = [["NA.", "JINA", "DARASA", "NAMBA", "WASTANI", "DARAJA"]]
    for i, r in enumerate(per_class_top1 or [], 1):
        data.append(
            [
                str(i),
                r.get("full_name") or "—",
                r.get("class_name") or "—",
                r.get("student_code") or "—",
                f"{r.get('average')}%" if r.get("average") is not None else "—",
                r.get("letter") or "—",
            ]
        )
    if len(data) == 1:
        data.append(["—", "Hakuna", "—", "—", "—", "—"])
    story.append(_table(data, col_widths=[1.2 * cm, 4.5 * cm, 3 * cm, 2.5 * cm, 2.2 * cm, 2 * cm]))

    if school_top1 and school_top1.get("full_name"):
        story.append(Spacer(1, 6))
        story.append(
            Paragraph(
                f"Bora madrasa: <b>{school_top1.get('full_name')}</b> — {school_top1.get('class_name')} "
                f"({school_top1.get('student_code') or '—'}) · {school_top1.get('average')}% ({school_top1.get('letter')})",
                st["body"],
            )
        )

    # SEHEMU 2 only when data exists (otherwise this PDF stays section-1 only)
    if best_per_subject:
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=0.8, color=LINE, spaceAfter=8))
        story.append(Paragraph("SEHEMU 2: BORA KWA KILA SOMO (KWA KILA DARASA)", st["h2"]))
        story.append(
            Paragraph("Mwanafunzi mmoja tu wa juu (#1) kwa kila somo ndani ya darasa.", st["body"])
        )
        data2 = [["NA.", "DARASA", "SOMO", "JINA", "NAMBA", "ALAMA"]]
        for i, r in enumerate(best_per_subject, 1):
            data2.append(
                [
                    str(i),
                    r.get("class_name") or "—",
                    r.get("subject_name") or "—",
                    r.get("full_name") or "—",
                    r.get("student_code") or "—",
                    str(r.get("marks") or "—"),
                ]
            )
        story.append(_table(data2, col_widths=[1.2 * cm, 2.5 * cm, 2.5 * cm, 4 * cm, 2.2 * cm, 2.2 * cm]))

    story.append(Paragraph(MOTTO, st["motto"]))
    doc.build(story)
    return buf.getvalue()

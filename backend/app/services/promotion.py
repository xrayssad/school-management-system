"""Kupandishwa / kurudishwa — scale YA DARASA (Kamati); mfululizo: Maandalizi → 1…5."""
from __future__ import annotations

import re
from collections import defaultdict

from sqlalchemy import text
from sqlalchemy.orm import Session

# Mpangilio kamili wa madarasa (index 0 = kwanza)
CLASS_ORDER = [
    "Maandalizi",
    "Darasa la 1",
    "Darasa la 2",
    "Darasa la 3",
    "Darasa la 4",
    "Darasa la 5",
]


def _norm(name: str | None) -> str:
    return (name or "").strip().lower()


def class_index(class_name: str | None) -> int | None:
    if not class_name:
        return None
    n = _norm(class_name)
    for i, c in enumerate(CLASS_ORDER):
        if _norm(c) == n:
            return i
    # aliases
    if n in ("nursery", "pre-primary", "preparation", "maandalizi"):
        return 0
    m = re.search(r"(\d+)", class_name)
    if m:
        num = int(m.group(1))
        if 1 <= num <= 5:
            return num  # Maandalizi=0, Darasa la 1 = index 1
    return None


def next_class_name(class_name: str | None) -> str | None:
    """Darasa linalofuata. Baada ya Darasa la 5 → None (hitimu)."""
    i = class_index(class_name)
    if i is None:
        return None
    if i >= len(CLASS_ORDER) - 1:
        return None
    return CLASS_ORDER[i + 1]


def letter_from_pct(pct: float, scale: dict | None) -> str:
    if scale:
        if pct >= float(scale.get("min_a") or 75):
            return "A"
        if pct >= float(scale.get("min_b") or 65):
            return "B"
        if pct >= float(scale.get("min_c") or 50):
            return "C"
        if pct >= float(scale.get("min_d") or 40):
            return "D"
        return "F"
    if pct >= 75:
        return "A"
    if pct >= 65:
        return "B"
    if pct >= 50:
        return "C"
    if pct >= 40:
        return "D"
    return "F"


def load_scales(db: Session) -> dict[str, dict]:
    try:
        rows = db.execute(text("SELECT * FROM grade_scales")).mappings().all()
        out = {}
        for r in rows:
            out[r["class_name"]] = dict(r)
            out[_norm(r["class_name"])] = dict(r)
        return out
    except Exception:
        db.rollback()
        return {}


def _scale_for(scales: dict, class_name: str) -> dict:
    return scales.get(class_name) or scales.get(_norm(class_name)) or {}


def compute_and_apply(
    db: Session,
    *,
    term: str = "Muhula 2",
    apply: bool = True,
    published_only: bool = True,
) -> dict:
    """
    Baada ya chapisho la matokeo:
    - wastani + grade kutoka scale YA DARASA (Kamati: min_a/b/c/d, min_promote_average)
    - % < min_promote_average au letter D/F → repeated (anabaki)
    - vinginevyo → promoted (class ifuate CLASS_ORDER) au graduated (baada ya la 5)
    """
    scales = load_scales(db)
    status_filter = (
        "AND COALESCE(g.status, 'published') = 'published'" if published_only else ""
    )

    rows = db.execute(
        text(
            f"""
            SELECT sp.id AS profile_id, sp.student_code, sp.class_name, u.full_name,
                   g.marks_obtained, e.title AS exam_title, e.total_marks
            FROM grades g
            JOIN student_profiles sp ON sp.id = g.student_id
            JOIN users u ON u.id = sp.user_id
            JOIN exams e ON e.id = g.exam_id
            WHERE 1=1 {status_filter}
            """
        )
    ).mappings().all()

    term_l = (term or "").lower()
    term_rows = [
        r
        for r in rows
        if term_l in (r.get("exam_title") or "").lower()
        or "muhula 2" in (r.get("exam_title") or "").lower()
        or "term 2" in (r.get("exam_title") or "").lower()
    ]
    use_rows = term_rows if term_rows else list(rows)

    by_student: dict[str, list] = defaultdict(list)
    meta: dict[str, dict] = {}
    for r in use_rows:
        total = float(r["total_marks"] or 100) or 100
        pct = float(r["marks_obtained"] or 0) / total * 100.0
        by_student[r["profile_id"]].append(pct)
        meta[r["profile_id"]] = {
            "student_code": r.get("student_code"),
            "class_name": r.get("class_name") or "",
            "full_name": r.get("full_name"),
        }

    items = []
    repeated = promoted = graduated = 0

    for pid, pcts in by_student.items():
        info = meta[pid]
        cn = info.get("class_name") or ""
        scale = _scale_for(scales, cn)
        min_promote = float(
            scale["min_promote_average"]
            if scale.get("min_promote_average") is not None
            else (scale.get("min_d") if scale.get("min_d") is not None else 40)
        )
        avg = sum(pcts) / len(pcts) if pcts else 0.0
        avg_letter = letter_from_pct(avg, scale if scale else None)

        new_class = None
        if avg_letter in ("D", "F", "E") or avg < min_promote:
            status = "repeated"
            note = (
                f"{term}: wastani {avg:.1f}% ({avg_letter}) "
                f"< kiwango {min_promote}% ({cn or '—'}) — anabaki darasa"
            )
            repeated += 1
        else:
            nxt = next_class_name(cn)
            if nxt is None and class_index(cn) is not None:
                status = "graduated"
                note = f"{term}: wastani {avg:.1f}% ({avg_letter}) — amehitimu baada ya Darasa la 5"
                graduated += 1
            elif nxt:
                status = "promoted"
                new_class = nxt
                note = f"{term}: wastani {avg:.1f}% ({avg_letter}) · {cn} → {nxt}"
                promoted += 1
            else:
                # class_name isiyo katika orodha — promoted bila kubadilisha
                status = "promoted"
                note = f"{term}: wastani {avg:.1f}% ({avg_letter}) — darasa halijulikani kwa mfululizo"
                promoted += 1

        if apply:
            if status == "promoted" and new_class:
                db.execute(
                    text(
                        """
                        UPDATE student_profiles SET
                          promotion_status = :st,
                          promotion_term = :term,
                          promotion_note = :note,
                          class_name = :new_cn
                        WHERE id = :id
                        """
                    ),
                    {
                        "st": status,
                        "term": term,
                        "note": note,
                        "new_cn": new_class,
                        "id": pid,
                    },
                )
            else:
                db.execute(
                    text(
                        """
                        UPDATE student_profiles SET
                          promotion_status = :st,
                          promotion_term = :term,
                          promotion_note = :note
                        WHERE id = :id
                        """
                    ),
                    {"st": status, "term": term, "note": note, "id": pid},
                )

        items.append(
            {
                "profile_id": pid,
                "full_name": info.get("full_name"),
                "student_code": info.get("student_code"),
                "class_name": cn,
                "new_class_name": new_class if status == "promoted" else cn,
                "average": round(avg, 1),
                "average_letter": avg_letter,
                "status": status,
                "note": note,
                "min_promote": min_promote,
                "subjects_count": len(pcts),
            }
        )

    if apply:
        db.commit()

    items.sort(key=lambda x: (x["class_name"] or "", x["full_name"] or ""))
    return {
        "term": term,
        "applied": apply,
        "class_order": CLASS_ORDER,
        "summary": {
            "repeated": repeated,
            "promoted": promoted,
            "graduated": graduated,
            "total": len(items),
        },
        "items": items,
    }

"""Ada ya mwanafunzi — inalingana na columns zilizopo kwenye student_fees."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db, engine
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-fees"])

MONTHS_SW = [
    "", "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni",
    "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba",
]


def _cols() -> set[str]:
    try:
        return {c["name"] for c in inspect(engine).get_columns("student_fees")}
    except Exception:
        return set()


@router.get("/my-fees")
def my_fees(
    year: int | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    y = year or datetime.utcnow().year
    sp = db.execute(
        text("SELECT id, student_code, class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).mappings().first()
    if not sp:
        return {"year": y, "years": [y], "months": [], "summary": {}}

    pid = sp["id"]
    c = _cols()
    if not c:
        # empty template 12 months
        months = [
            {
                "month": m,
                "month_name": MONTHS_SW[m],
                "amount": 0,
                "amount_paid": 0,
                "status": "unpaid",
                "paid_at": None,
                "note": None,
            }
            for m in range(1, 13)
        ]
        return {
            "year": y,
            "years": [y],
            "student_code": sp["student_code"],
            "class_name": sp["class_name"],
            "months": months,
            "summary": {
                "total_due": 0,
                "total_paid": 0,
                "balance": 0,
                "months_paid": 0,
                "months_total": 12,
            },
        }

    # Build SELECT from available columns
    select_parts = []
    for name in ("month", "year", "amount", "status", "paid_at", "note", "student_id"):
        if name in c:
            select_parts.append(name)
    if "amount_paid" in c:
        select_parts.append("amount_paid")
    elif "paid_amount" in c:
        select_parts.append("paid_amount AS amount_paid")
    else:
        select_parts.append("0::numeric AS amount_paid")

    # student id column
    sid_col = "student_id" if "student_id" in c else ("student_profile_id" if "student_profile_id" in c else None)
    year_col = "year" if "year" in c else None
    month_col = "month" if "month" in c else None

    params: dict = {"pid": pid}
    where = ["1=1"]
    if sid_col:
        where.append(f"{sid_col} = :pid")
    if year_col:
        where.append(f"{year_col} = :y")
        params["y"] = y

    sql = f"SELECT {', '.join(select_parts)} FROM student_fees WHERE {' AND '.join(where)}"
    try:
        raw = [dict(r) for r in db.execute(text(sql), params).mappings().all()]
    except Exception as e:
        db.rollback()
        # fallback empty year
        raw = []

    by_month: dict[int, dict] = {}
    for r in raw:
        m = int(r.get("month") or 0)
        if 1 <= m <= 12:
            by_month[m] = r

    months = []
    total_due = total_paid = paid_count = 0
    for m in range(1, 13):
        r = by_month.get(m) or {}
        amount = float(r.get("amount") or 0)
        paid = float(r.get("amount_paid") or 0)
        status = (str(r.get("status") or "unpaid")).lower()
        if status not in ("paid", "partial", "unpaid", "waived"):
            status = "paid" if amount > 0 and paid >= amount else ("partial" if paid > 0 else "unpaid")
        months.append(
            {
                "month": m,
                "month_name": MONTHS_SW[m],
                "amount": amount,
                "amount_paid": paid,
                "status": status,
                "paid_at": r.get("paid_at"),
                "note": r.get("note"),
            }
        )
        total_due += amount
        total_paid += paid
        if status in ("paid", "waived"):
            paid_count += 1

    years = [y]
    if year_col and sid_col:
        try:
            years = [
                int(x[0])
                for x in db.execute(
                    text(f"SELECT DISTINCT {year_col} FROM student_fees WHERE {sid_col}=:pid ORDER BY 1 DESC"),
                    {"pid": pid},
                ).fetchall()
            ]
            if y not in years:
                years = sorted(set(years + [y]), reverse=True)
        except Exception:
            db.rollback()
            years = [y]

    return {
        "year": y,
        "years": years or [y],
        "student_code": sp["student_code"],
        "class_name": sp["class_name"],
        "months": months,
        "summary": {
            "total_due": total_due,
            "total_paid": total_paid,
            "balance": max(total_due - total_paid, 0),
            "months_paid": paid_count,
            "months_total": 12,
        },
    }

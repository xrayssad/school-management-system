"""Ada ya mwanafunzi — student_id = student_profiles.id (kama Kamati)."""
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


@router.get("/my-fees")
def my_fees(
    year: int | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    y = int(year or datetime.utcnow().year)
    sp = db.execute(
        text(
            "SELECT id, student_code, class_name FROM student_profiles WHERE user_id = :u"
        ),
        {"u": user.id},
    ).mappings().first()
    if not sp:
        return {"year": y, "years": [y], "months": [], "summary": {}}

    pid = sp["id"]  # profile id — same as committee mark-paid

    # All fee rows for this profile this year (string or int year/month)
    rows = db.execute(
        text(
            """
            SELECT month, year, amount, amount_paid, status, paid_at, note
            FROM student_fees
            WHERE student_id = :pid
              AND CAST(year AS TEXT) = :y
            """
        ),
        {"pid": pid, "y": str(y)},
    ).mappings().all()

    by_month: dict[int, dict] = {}
    for r in rows:
        try:
            m = int(r["month"])
        except Exception:
            continue
        by_month[m] = dict(r)

    months = []
    total_due = 0.0
    total_paid = 0.0
    months_paid = 0
    for m in range(1, 13):
        r = by_month.get(m)
        amount = float(r["amount"] or 0) if r else 0.0
        paid = float(r["amount_paid"] or 0) if r else 0.0
        status = (r["status"] if r else None) or "unpaid"
        if status == "paid":
            months_paid += 1
            if paid <= 0 and amount > 0:
                paid = amount
        total_due += amount
        total_paid += paid
        months.append(
            {
                "month": m,
                "month_name": MONTHS_SW[m],
                "amount": amount,
                "amount_paid": paid,
                "status": status,
                "paid_at": r.get("paid_at") if r else None,
                "note": r.get("note") if r else None,
            }
        )

    years_rows = db.execute(
        text(
            """
            SELECT DISTINCT CAST(year AS TEXT) AS y FROM student_fees
            WHERE student_id = :pid ORDER BY 1 DESC
            """
        ),
        {"pid": pid},
    ).fetchall()
    years = [int(r[0]) for r in years_rows if r[0]] or [y]
    if y not in years:
        years = sorted(set(years + [y]), reverse=True)

    return {
        "year": y,
        "years": years,
        "student_code": sp["student_code"],
        "class_name": sp["class_name"],
        "months": months,
        "summary": {
            "total_due": total_due,
            "total_paid": total_paid,
            "balance": max(0.0, total_due - total_paid),
            "months_paid": months_paid,
            "months_total": 12,
        },
    }

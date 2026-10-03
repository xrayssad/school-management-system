"""Kamati Ada — student_id = profile id, student_user_id = users.id."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/fees", tags=["committee-fees"])
require_committee = require_role(UserRole.committee, UserRole.admin)

MONTHS_SW = [
    "", "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni",
    "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba",
]


def _ensure_fees_table(db: Session) -> None:
    """Force student_fees columns required by mark-paid / set-amount."""
    from sqlalchemy.exc import SQLAlchemyError
    stmts = [
        """
        CREATE TABLE IF NOT EXISTS student_fees (
            id VARCHAR(36) PRIMARY KEY
        )
        """,
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS student_id VARCHAR(36)",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS student_user_id VARCHAR(36)",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS year VARCHAR(10)",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS month VARCHAR(10)",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) DEFAULT 0",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12,2) DEFAULT 0",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'unpaid'",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS note TEXT",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36)",
        "ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP",
    ]
    for sql in stmts:
        try:
            db.execute(text(sql))
            db.commit()
        except Exception:
            db.rollback()



class SetAmountBody(BaseModel):
    class_name: str
    year: int
    month: int
    amount: float


class MarkPaidBody(BaseModel):
    student_id: str  # student_profiles.id
    year: int
    month: int
    amount_paid: float | None = None
    status: str = "paid"
    note: str | None = None


def _fee_row(db: Session, sid: str, y: int, m: int):
    """Return fee dict or None. Never raises."""
    try:
        row = db.execute(
            text(
                """
                SELECT * FROM student_fees
                WHERE CAST(student_id AS TEXT) = :sid
                  AND CAST(year AS TEXT) = :y
                  AND CAST(month AS TEXT) = :m
                LIMIT 1
                """
            ),
            {"sid": str(sid), "y": str(y), "m": str(m)},
        ).mappings().first()
        return dict(row) if row else None
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        try:
            row = db.execute(
                text(
                    """
                    SELECT * FROM student_fees
                    WHERE CAST(student_user_id AS TEXT) = :sid
                      AND CAST(year AS TEXT) = :y
                      AND CAST(month AS TEXT) = :m
                    LIMIT 1
                    """
                ),
                {"sid": str(sid), "y": str(y), "m": str(m)},
            ).mappings().first()
            return dict(row) if row else None
        except Exception:
            try:
                db.rollback()
            except Exception:
                pass
            return None



def _user_id_for_profile(db: Session, profile_id: str) -> str | None:
    return db.execute(
        text("SELECT user_id FROM student_profiles WHERE id = :id"),
        {"id": profile_id},
    ).scalar()


@router.get("/students")
def list_by_class(
    class_name: str = Query(...),
    year: int | None = None,
    month: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    y = int(year or datetime.utcnow().year)
    m = int(month or datetime.utcnow().month)
    if m < 1 or m > 12:
        m = int(datetime.utcnow().month)
    _months = ["", "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"]
    month_name = _months[m] if 0 < m < len(_months) else str(m)

    # Students only — minimal query
    try:
        students = db.execute(
            text(
                """
                SELECT sp.id AS student_id, sp.user_id, sp.student_code, sp.class_name,
                       u.full_name, u.email
                FROM student_profiles sp
                JOIN users u ON u.id = sp.user_id
                WHERE sp.class_name = :cn
                ORDER BY u.full_name
                """
            ),
            {"cn": class_name},
        ).mappings().all()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"students query: {type(e).__name__}: {e}") from e

    out = []
    for s in students:
        fee = _fee_row(db, s["student_id"], y, m)
        if fee is None and s.get("user_id"):
            fee = _fee_row(db, s["user_id"], y, m)
        amount = 0.0
        amount_paid = 0.0
        status = "unpaid"
        paid_at = None
        note = None
        fee_id = None
        if fee:
            for k, default in (("amount", 0), ("amount_paid", 0)):
                try:
                    if k == "amount":
                        amount = float(fee.get(k) or 0)
                    else:
                        amount_paid = float(fee.get(k) or 0)
                except Exception:
                    pass
            status = str(fee.get("status") or "unpaid")
            paid_at = fee.get("paid_at")
            note = fee.get("note")
            fee_id = fee.get("id")
        out.append({
            "student_id": s["student_id"],
            "user_id": s["user_id"],
            "student_code": s.get("student_code"),
            "class_name": s.get("class_name"),
            "full_name": s.get("full_name"),
            "email": s.get("email"),
            "year": y,
            "month": m,
            "month_name": month_name,
            "amount": amount,
            "amount_paid": amount_paid,
            "status": status,
            "paid_at": paid_at,
            "note": note,
            "fee_id": fee_id,
        })
    return {
        "class_name": class_name,
        "year": y,
        "month": m,
        "month_name": month_name,
        "students": out,
    }



@router.post("/set-amount")
def set_amount_for_class(
    body: SetAmountBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    _ensure_fees_table(db)
    if not (1 <= body.month <= 12):
        raise HTTPException(400, detail="Mwezi 1–12")
    students = db.execute(
        text(
            """
            SELECT sp.id, sp.user_id FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.class_name = :cn AND u.is_active = true
            """
        ),
        {"cn": body.class_name},
    ).mappings().all()
    n = 0
    for s in students:
        existing = _fee_row(db, s["id"], body.year, body.month)
        if existing:
            db.execute(
                text(
                    "UPDATE student_fees SET amount = :a, updated_by = :u, student_user_id = COALESCE(student_user_id, :uid) WHERE id = :id"
                ),
                {"a": body.amount, "u": user.id, "uid": s["user_id"], "id": existing["id"]},
            )
        else:
            db.execute(
                text(
                    """
                    INSERT INTO student_fees
                      (id, student_id, student_user_id, year, month, amount, amount_paid, status, updated_by, created_at)
                    VALUES (:id, :s, :uid, :y, :m, :a, 0, 'unpaid', :u, :ca)
                    """
                ),
                {
                    "id": str(uuid.uuid4()),
                    "s": s["id"],
                    "uid": s["user_id"],
                    "y": str(body.year),
                    "m": str(body.month),
                    "a": body.amount,
                    "u": user.id,
                    "ca": datetime.utcnow(),
                },
            )
        n += 1
    db.commit()
    return {"ok": True, "updated": n, "amount": body.amount}


@router.post("/mark-paid")
def mark_paid(
    body: MarkPaidBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    if body.status not in ("paid", "partial", "unpaid", "waived"):
        raise HTTPException(400, detail="status: paid|partial|unpaid|waived")
    if not (1 <= int(body.month) <= 12):
        raise HTTPException(400, detail="Mwezi 1–12")
    try:
        _ensure_fees_table(db)
    except Exception:
        db.rollback()

    uid = _user_id_for_profile(db, body.student_id)
    if not uid:
        raise HTTPException(404, detail="Mwanafunzi haipo")

    try:
        existing = _fee_row(db, body.student_id, body.year, body.month)
        amount = float((existing or {}).get("amount") or 0) if existing else 0
        paid = body.amount_paid
        if paid is None:
            paid = amount if body.status in ("paid", "waived") else 0
        paid_at = datetime.utcnow() if body.status in ("paid", "partial") else None

        if existing:
            db.execute(
                text(
                    """
                    UPDATE student_fees SET
                      amount_paid = :paid, status = :st, paid_at = :pa,
                      note = :note, updated_by = :u,
                      student_user_id = COALESCE(student_user_id, :uid)
                    WHERE id = :id
                    """
                ),
                {
                    "paid": paid,
                    "st": body.status,
                    "pa": paid_at,
                    "note": body.note,
                    "u": user.id,
                    "uid": uid,
                    "id": existing["id"],
                },
            )
        else:
            db.execute(
                text(
                    """
                    INSERT INTO student_fees
                      (id, student_id, student_user_id, year, month, amount, amount_paid, status, paid_at, note, updated_by, created_at)
                    VALUES (:id, :s, :uid, :y, :m, :a, :paid, :st, :pa, :note, :u, :ca)
                    """
                ),
                {
                    "id": str(uuid.uuid4()),
                    "s": body.student_id,
                    "uid": uid,
                    "y": str(body.year),
                    "m": str(body.month),
                    "a": amount or paid or 0,
                    "paid": paid or 0,
                    "st": body.status,
                    "pa": paid_at,
                    "note": body.note,
                    "u": user.id,
                    "ca": datetime.utcnow(),
                },
            )
        db.commit()
        return {"ok": True, "status": body.status, "amount_paid": paid}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Imeshindikana kuidhinisha malipo: {e}") from e



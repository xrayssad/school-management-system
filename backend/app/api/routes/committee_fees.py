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
    return db.execute(
        text(
            """
            SELECT id, amount, amount_paid, status, paid_at, note
            FROM student_fees
            WHERE student_id = :sid
              AND CAST(year AS TEXT) = :y
              AND CAST(month AS TEXT) = :m
            LIMIT 1
            """
        ),
        {"sid": sid, "y": str(y), "m": str(m)},
    ).mappings().first()


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
    y = year or datetime.utcnow().year
    m = month or datetime.utcnow().month
    students = db.execute(
        text(
            """
            SELECT sp.id AS student_id, sp.user_id, sp.student_code, sp.class_name,
                   u.full_name, u.email
            FROM student_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.class_name = :cn AND u.is_active = true
            ORDER BY u.full_name
            """
        ),
        {"cn": class_name},
    ).mappings().all()

    out = []
    for s in students:
        fee = _fee_row(db, s["student_id"], y, m)
        out.append(
            {
                "student_id": s["student_id"],
                "user_id": s["user_id"],
                "student_code": s["student_code"],
                "class_name": s["class_name"],
                "full_name": s["full_name"],
                "email": s["email"],
                "year": y,
                "month": m,
                "month_name": MONTHS_SW[m],
                "amount": float(fee["amount"] or 0) if fee else 0,
                "amount_paid": float(fee["amount_paid"] or 0) if fee else 0,
                "status": (fee["status"] if fee else "unpaid") or "unpaid",
                "paid_at": fee["paid_at"] if fee else None,
                "note": fee["note"] if fee else None,
                "fee_id": fee["id"] if fee else None,
            }
        )
    return {
        "class_name": class_name,
        "year": y,
        "month": m,
        "month_name": MONTHS_SW[m],
        "students": out,
    }


@router.post("/set-amount")
def set_amount_for_class(
    body: SetAmountBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
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
    if not (1 <= body.month <= 12):
        raise HTTPException(400, detail="Mwezi 1–12")

    uid = _user_id_for_profile(db, body.student_id)
    if not uid:
        raise HTTPException(404, detail="Mwanafunzi haipo")

    existing = _fee_row(db, body.student_id, body.year, body.month)
    amount = float(existing["amount"] or 0) if existing else 0
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
                "a": amount or paid,
                "paid": paid,
                "st": body.status,
                "pa": paid_at,
                "note": body.note,
                "u": user.id,
                "ca": datetime.utcnow(),
            },
        )
    db.commit()
    return {"ok": True, "status": body.status, "amount_paid": paid}

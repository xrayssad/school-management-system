"""Kamati: orodha, ongeza committee, mwalimu → committee."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/users", tags=["committee-users"])
require_committee = require_role(UserRole.committee, UserRole.admin)


class PromoteTeacherIn(BaseModel):
    user_id: str


class CreateCommitteeIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: str | None = None


@router.get("")
def list_staff(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    """Walimu + wanachama wa Kamati."""
    rows = db.execute(
        text(
            """
            SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_active, u.created_at,
                   tp.id AS teacher_profile_id
            FROM users u
            LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
            WHERE u.role IN ('teacher', 'committee', 'admin')
            ORDER BY u.role, u.full_name
            """
        )
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/teachers")
def list_teachers(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(
        text(
            """
            SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_active
            FROM users u
            WHERE u.role = 'teacher'
            ORDER BY u.full_name
            """
        )
    ).mappings().all()
    return [dict(r) for r in rows]


@router.post("/promote-teacher")
def promote_teacher(
    body: PromoteTeacherIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    """Badilisha role ya mwalimu → committee (anakaa akaunti ile)."""
    row = db.execute(
        text("SELECT id, role, full_name, email FROM users WHERE id = :id"),
        {"id": body.user_id},
    ).mappings().first()
    if not row:
        raise HTTPException(404, detail="Mtumiaji haipo")
    if row["role"] not in ("teacher", "student"):
        if row["role"] == "committee":
            return {"ok": True, "message": "Tayari ni Kamati", "user": dict(row)}
        raise HTTPException(400, detail=f"Haiwezi kubadilisha role {row['role']}")

    db.execute(
        text("UPDATE users SET role = 'committee' WHERE id = :id"),
        {"id": body.user_id},
    )
    db.commit()
    return {
        "ok": True,
        "message": f"{row['full_name']} sasa ni Kamati",
        "user_id": body.user_id,
        "email": row["email"],
        "by": current.email,
    }


@router.post("/create-committee")
def create_committee(
    body: CreateCommitteeIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    """Ongeza mtumiaji mpya wa role committee."""
    email = body.email.lower().strip()
    exists = db.execute(text("SELECT id FROM users WHERE email = :e"), {"e": email}).first()
    if exists:
        raise HTTPException(400, detail="Barua pepe tayari inatumika")

    uid = str(uuid.uuid4())
    try:
        db.execute(
            text(
                """
                INSERT INTO users
                  (id, email, hashed_password, full_name, role, phone, is_active, created_at)
                VALUES
                  (:id, :email, :hp, :fn, 'committee', :phone, true, :ca)
                """
            ),
            {
                "id": uid,
                "email": email,
                "hp": hash_password(body.password),
                "fn": body.full_name.strip(),
                "phone": body.phone,
                "ca": datetime.utcnow(),
            },
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(400, detail=str(e))

    return {
        "ok": True,
        "id": uid,
        "email": email,
        "full_name": body.full_name.strip(),
        "role": "committee",
        "by": current.email,
    }


@router.post("/demote-to-teacher")
def demote_to_teacher(
    body: PromoteTeacherIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    """Committee → teacher (si wewe mwenyewe)."""
    if body.user_id == current.id:
        raise HTTPException(400, detail="Huwezi kujiondoa mwenyewe")
    row = db.execute(
        text("SELECT id, role, full_name FROM users WHERE id = :id"),
        {"id": body.user_id},
    ).mappings().first()
    if not row:
        raise HTTPException(404, detail="Haipo")
    if row["role"] != "committee":
        raise HTTPException(400, detail="Si mwanachama wa Kamati")
    db.execute(text("UPDATE users SET role = 'teacher' WHERE id = :id"), {"id": body.user_id})
    # hakikisha teacher_profile
    has = db.execute(
        text("SELECT id FROM teacher_profiles WHERE user_id = :u"), {"u": body.user_id}
    ).first()
    if not has:
        db.execute(
            text(
                "INSERT INTO teacher_profiles (id, user_id) VALUES (:id, :u)"
            ),
            {"id": str(uuid.uuid4()), "u": body.user_id},
        )
    db.commit()
    return {"ok": True, "message": f"{row['full_name']} sasa ni mwalimu"}

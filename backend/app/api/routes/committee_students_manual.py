
"""Kamati: ongeza mwanafunzi mmoja kwa mkono (sawa na CSV import)."""
from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/students", tags=["committee-students-manual"])
require_committee = require_role(UserRole.committee, UserRole.admin)


class ManualStudentIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr | None = None
    class_name: str = "Darasa la 1"
    phone: str | None = None
    password: str = Field(default="Student@123", min_length=6)
    student_code: str | None = None


def _next_code(db: Session) -> str:
    n = db.execute(text("SELECT COUNT(*) FROM student_profiles")).scalar() or 0
    return f"STU{90000 + int(n) + 1}"


@router.post("/create-one")
def create_one(
    body: ManualStudentIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    code = (body.student_code or "").strip() or _next_code(db)
    email = (str(body.email) if body.email else f"{code.lower()}@student.madrasa.local").strip().lower()

    exists = db.execute(text("SELECT id FROM users WHERE email = :e"), {"e": email}).first()
    if exists:
        raise HTTPException(400, detail=f"Barua pepe tayari ipo: {email}")

    code_exists = db.execute(
        text("SELECT id FROM student_profiles WHERE student_code = :c"), {"c": code}
    ).first()
    if code_exists:
        raise HTTPException(400, detail=f"Namba ya usajili tayari ipo: {code}")

    uid = str(uuid.uuid4())
    pid = str(uuid.uuid4())
    db.execute(
        text(
            """
            INSERT INTO users (id, email, hashed_password, full_name, role, phone, is_active, created_at)
            VALUES (:id, :email, :hp, :name, 'student', :phone, true, NOW())
            """
        ),
        {
            "id": uid,
            "email": email,
            "hp": hash_password(body.password),
            "name": body.full_name.strip(),
            "phone": body.phone,
        },
    )
    db.execute(
        text(
            """
            INSERT INTO student_profiles
              (id, user_id, student_code, class_name, enrollment_date)
            VALUES (:id, :uid, :code, :cn, :ed)
            """
        ),
        {
            "id": pid,
            "uid": uid,
            "code": code,
            "cn": body.class_name,
            "ed": date.today(),
        },
    )
    db.commit()
    return {
        "ok": True,
        "user_id": uid,
        "student_code": code,
        "email": email,
        "class_name": body.class_name,
        "password_set": True,
        "by": user.email,
    }

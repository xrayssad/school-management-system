
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
    from datetime import datetime
    year = datetime.utcnow().year
    prefix = f"MHM.{year}/"
    rows = db.execute(
        text("SELECT student_code FROM student_profiles WHERE student_code LIKE :p"),
        {"p": f"{prefix}%"},
    ).scalars().all()
    max_n = 0
    for c in rows:
        try:
            max_n = max(max_n, int(str(c).split("/")[-1]))
        except Exception:
            pass
    n = max_n + 1
    for _ in range(5000):
        code = f"{prefix}{n:03d}"
        exists = db.execute(
            text("SELECT 1 FROM student_profiles WHERE student_code = :c"), {"c": code}
        ).first()
        if not exists:
            return code
        n += 1
    return f"{prefix}{n:03d}"


@router.post("/create-one")
def create_one(
    body: ManualStudentIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_committee),
):
    code = (body.student_code or "").strip() or _next_code(db)
    code = code.replace(" ", "").replace(".", "/", 1) if code.count("/") == 0 and code.upper().startswith("MHM.") and code.count(".") >= 2 else code
    # if user typed MHM.2026.001 → MHM.2026/001
    if code.upper().startswith("MHM.") and "/" not in code:
        parts = code.split(".")
        if len(parts) >= 3:
            code = f"{parts[0]}.{parts[1]}/{'.'.join(parts[2:])}"
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


class StudentUpdateIn(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    class_name: str | None = None
    student_code: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    password: str | None = Field(default=None, min_length=6)
    is_active: bool | None = None


def _norm_code(code: str) -> str:
    """MHM.2026/001 — slash kabla ya namba."""
    c = code.strip().upper().replace(" ", "")
    if c.startswith("MHM.") and "/" not in c:
        parts = c.split(".")
        if len(parts) >= 3:
            c = f"{parts[0]}.{parts[1]}/" + ".".join(parts[2:])
    return c


@router.patch("/{user_id}")
def update_student(
    user_id: str,
    body: StudentUpdateIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    row = db.execute(
        text(
            """
            SELECT u.id AS user_id, sp.id AS profile_id
            FROM users u
            JOIN student_profiles sp ON sp.user_id = u.id
            WHERE u.id = :id AND CAST(u.role AS VARCHAR) = 'student'
            """
        ),
        {"id": user_id},
    ).mappings().first()
    if not row:
        raise HTTPException(404, detail="Mwanafunzi haipo")
    pid = row["profile_id"]
    if body.full_name is not None:
        db.execute(text("UPDATE users SET full_name = :v WHERE id = :id"), {"v": body.full_name.strip(), "id": user_id})
    if body.email is not None:
        db.execute(text("UPDATE users SET email = :v WHERE id = :id"), {"v": body.email.strip().lower(), "id": user_id})
    if body.phone is not None:
        db.execute(text("UPDATE users SET phone = :v WHERE id = :id"), {"v": body.phone, "id": user_id})
    if body.is_active is not None:
        db.execute(text("UPDATE users SET is_active = :v WHERE id = :id"), {"v": body.is_active, "id": user_id})
    if body.password:
        db.execute(text("UPDATE users SET hashed_password = :v WHERE id = :id"), {"v": hash_password(body.password), "id": user_id})
    if body.class_name is not None:
        db.execute(text("UPDATE student_profiles SET class_name = :v WHERE id = :pid"), {"v": body.class_name, "pid": pid})
    if body.student_code is not None:
        db.execute(text("UPDATE student_profiles SET student_code = :v WHERE id = :pid"), {"v": _norm_code(body.student_code), "pid": pid})
    if body.guardian_name is not None:
        db.execute(text("UPDATE student_profiles SET guardian_name = :v WHERE id = :pid"), {"v": body.guardian_name, "pid": pid})
    if body.guardian_phone is not None:
        db.execute(text("UPDATE student_profiles SET guardian_phone = :v WHERE id = :pid"), {"v": body.guardian_phone, "pid": pid})
    db.commit()
    return {"ok": True, "user_id": user_id}


@router.post("/{user_id}/block")
def block_student(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    n = db.execute(
        text("UPDATE users SET is_active = false WHERE id = :id AND CAST(role AS VARCHAR) = 'student'"),
        {"id": user_id},
    ).rowcount
    db.commit()
    if not n:
        raise HTTPException(404, detail="Mwanafunzi haipo")
    return {"ok": True, "blocked": True}


@router.post("/{user_id}/unblock")
def unblock_student(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    n = db.execute(
        text("UPDATE users SET is_active = true WHERE id = :id AND CAST(role AS VARCHAR) = 'student'"),
        {"id": user_id},
    ).rowcount
    db.commit()
    if not n:
        raise HTTPException(404, detail="Mwanafunzi haipo")
    return {"ok": True, "blocked": False}


@router.delete("/{user_id}")
def delete_student(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = db.execute(
        text(
            """
            SELECT sp.id AS profile_id FROM users u
            JOIN student_profiles sp ON sp.user_id = u.id
            WHERE u.id = :id AND CAST(u.role AS VARCHAR) = 'student'
            """
        ),
        {"id": user_id},
    ).mappings().first()
    if not row:
        raise HTTPException(404, detail="Mwanafunzi haipo")
    pid = row["profile_id"]
    for sql in [
        "DELETE FROM grades WHERE student_id = :pid",
        "DELETE FROM student_profiles WHERE id = :pid",
        "DELETE FROM users WHERE id = :uid",
    ]:
        try:
            db.execute(text(sql), {"pid": pid, "uid": user_id})
        except Exception:
            db.rollback()
    db.commit()
    return {"ok": True, "deleted": user_id}


from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-profile"])


@router.get("/my-profile")
def my_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != UserRole.student:
        raise HTTPException(403, "Kwa wanafunzi tu")

    sp = db.execute(
        text("SELECT id, student_code, class_name FROM student_profiles WHERE user_id = :u"),
        {"u": user.id},
    ).mappings().first()

    extra = {}
    if sp:
        for cols in [
            "guardian_name, guardian_phone, address, enrollment_date",
            "guardian_name, guardian_phone",
            "",
        ]:
            if not cols:
                break
            try:
                row = db.execute(
                    text(f"SELECT {cols} FROM student_profiles WHERE id = :id"),
                    {"id": sp["id"]},
                ).mappings().first()
                if row:
                    extra = dict(row)
                break
            except Exception:
                db.rollback()

        for cols in [
            "promotion_status, promotion_term, promotion_note",
            "",
        ]:
            if not cols:
                break
            try:
                row = db.execute(
                    text(f"SELECT {cols} FROM student_profiles WHERE id = :id"),
                    {"id": sp["id"]},
                ).mappings().first()
                if row:
                    extra.update(dict(row))
                break
            except Exception:
                db.rollback()

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": getattr(user, "phone", None),
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "student_code": sp.get("student_code") if sp else None,
        "class_name": sp.get("class_name") if sp else None,
        "guardian_name": extra.get("guardian_name"),
        "guardian_phone": extra.get("guardian_phone"),
        "address": extra.get("address"),
        "enrollment_date": extra.get("enrollment_date"),
        "promotion_status": extra.get("promotion_status"),
        "promotion_term": extra.get("promotion_term"),
        "promotion_note": extra.get("promotion_note"),
    }

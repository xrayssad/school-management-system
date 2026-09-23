
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/student", tags=["student-profile"])

@router.get("/my-profile")
def my_profile(db: Session = Depends(get_db), user: User = Depends(require_role(UserRole.student))):
    sp = db.execute(text("""
        SELECT student_code, class_name, guardian_name, guardian_phone, address,
               promotion_status, promotion_term, promotion_note, enrollment_date
        FROM student_profiles WHERE user_id = :u
    """), {"u": user.id}).mappings().first()

    guardian_name = sp["guardian_name"] if sp else None
    guardian_phone = sp["guardian_phone"] if sp else None

    # Fallback: registration_requests (jina la mzazi/mlezi)
    if not guardian_name or not guardian_phone:
        rr = db.execute(text("""
            SELECT guardian_name, guardian_phone FROM registration_requests
            WHERE lower(email) = lower(:e)
            ORDER BY created_at DESC NULLS LAST
            LIMIT 1
        """), {"e": user.email}).mappings().first()
        if not rr and sp and sp.get("student_code"):
            rr = db.execute(text("""
                SELECT guardian_name, guardian_phone FROM registration_requests
                WHERE student_code = :c
                ORDER BY created_at DESC NULLS LAST LIMIT 1
            """), {"c": sp["student_code"]}).mappings().first()
        if rr:
            guardian_name = guardian_name or rr["guardian_name"]
            guardian_phone = guardian_phone or rr["guardian_phone"]
            # optional persist
            if sp and (rr["guardian_name"] or rr["guardian_phone"]):
                db.execute(text("""
                    UPDATE student_profiles SET
                      guardian_name = COALESCE(NULLIF(guardian_name,''), :gn),
                      guardian_phone = COALESCE(NULLIF(guardian_phone,''), :gp)
                    WHERE user_id = :u
                """), {"gn": rr["guardian_name"], "gp": rr["guardian_phone"], "u": user.id})
                db.commit()

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "student_code": sp["student_code"] if sp else None,
        "class_name": sp["class_name"] if sp else None,
        "guardian_name": guardian_name,
        "guardian_phone": guardian_phone,
        "promotion_status": sp["promotion_status"] if sp else None,
        "promotion_note": sp["promotion_note"] if sp else None,
        "student_profile": {
            **(dict(sp) if sp else {}),
            "guardian_name": guardian_name,
            "guardian_phone": guardian_phone,
        },
    }

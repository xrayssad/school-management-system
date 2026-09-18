from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.api.routes.auth_password import create_reset_for_user, send_email

router = APIRouter(prefix="/committee", tags=["committee-password"])
require_committee = require_role(UserRole.committee, UserRole.admin)


class SetPasswordIn(BaseModel):
    new_password: str = Field(min_length=6, max_length=128)


@router.post("/users/{user_id}/set-password")
def set_user_password(
    user_id: str,
    body: SetPasswordIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    """Kamati inaweka nenosiri jipya kwa mwanafunzi au mwalimu."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Mtumiaji hakupatikana")
    if user.role not in (UserRole.student, UserRole.teacher):
        raise HTTPException(status_code=400, detail="Unaweza kubadilisha nenosiri la mwanafunzi au mwalimu tu")
    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"detail": f"Nenosiri la {user.full_name} limebadilishwa.", "email": user.email}


@router.post("/users/{user_id}/send-reset-email")
def send_reset_email(
    user_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    """Kamati inatuma kiungo cha reset kwa email ya mwanafunzi/mwalimu."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Mtumiaji hakupatikana")
    if user.role not in (UserRole.student, UserRole.teacher):
        raise HTTPException(status_code=400, detail="Kwa mwanafunzi au mwalimu tu")
    _, link = create_reset_for_user(db, user)
    body = (
        f"Habari {user.full_name},\n\n"
        f"Uongozi wa Kamati umeomba ubadilishaji wa nenosiri la akaunti yako.\n\n"
        f"Kiungo (saa 2):\n{link}\n\n"
        f"— Al Madrasat Habiib El Mustwafaa"
    )
    sent = send_email(user.email, "Badilisha nenosiri — Madrasa", body)
    out = {"detail": "Kiungo kimetumwa." if sent else "SMTP imeshindwa — angalia dev_reset_link", "email": user.email}
    if not sent:
        out["dev_reset_link"] = link
    return out


@router.post("/me/send-reset-email")
def committee_self_reset_email(
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    """Kamati inajituma kiungo cha reset kwa email yake."""
    _, link = create_reset_for_user(db, current)
    body = (
        f"Habari {current.full_name},\n\n"
        f"Ombi la kubadilisha nenosiri la akaunti yako ya Kamati.\n\n"
        f"Kiungo (saa 2):\n{link}\n\n"
        f"— Al Madrasat Habiib El Mustwafaa"
    )
    sent = send_email(current.email, "Badilisha nenosiri (Kamati) — Madrasa", body)
    out = {"detail": "Angalia barua pepe yako." if sent else "SMTP imeshindwa — tumia dev_reset_link", "email": current.email}
    if not sent:
        out["dev_reset_link"] = link
    return out


@router.get("/teachers-brief")
def teachers_brief(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.query(User).filter(User.role == UserRole.teacher).order_by(User.full_name).all()
    return [{"id": u.id, "full_name": u.full_name, "email": u.email, "role": "teacher", "phone": u.phone} for u in rows]

@router.get("/students-brief")
def students_brief(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.query(User).filter(User.role == UserRole.student).order_by(User.full_name).all()
    return [{"id": u.id, "full_name": u.full_name, "email": u.email, "role": "student", "phone": u.phone} for u in rows]

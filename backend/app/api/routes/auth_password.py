"""Password forgot/reset via email only."""
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.models.fees import PasswordResetToken
from app.schemas.fees import ForgotPasswordIn, ResetPasswordIn

router = APIRouter(prefix="/auth", tags=["auth-password"])


def send_email(to: str, subject: str, body: str) -> bool:
    if not getattr(settings, "SMTP_HOST", None) or not getattr(settings, "SMTP_USER", None):
        return False
    import smtplib
    from email.message import EmailMessage

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = getattr(settings, "SMTP_FROM", None) or settings.SMTP_USER
    msg["To"] = to
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.SMTP_HOST, int(getattr(settings, "SMTP_PORT", 587) or 587)) as s:
            s.starttls()
            s.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            s.send_message(msg)
        return True
    except Exception as e:
        print("SMTP error:", e)
        return False


def create_reset_for_user(db: Session, user: User) -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    row = PasswordResetToken(
        user_id=user.id,
        token=token,
        channel="email",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=2),
    )
    db.add(row)
    db.commit()
    front = getattr(settings, "FRONTEND_URL", None) or "http://localhost:3000"
    link = f"{front}/reset-password?token={token}"
    return token, link


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    """Identifier: email AU student_code. Tuma link kwa email ya akaunti."""
    ident = payload.identifier.strip()
    user = None
    sp = db.query(StudentProfile).filter(StudentProfile.student_code == ident.upper()).first()
    if sp:
        user = db.get(User, sp.user_id)
    else:
        user = db.query(User).filter(User.email == ident.lower()).first()

    ok = {"detail": "Ikiwa akaunti ipo, tumekutumia kiungo cha kubadilisha nenosiri kwenye barua pepe."}
    if not user or not user.email:
        return ok

    _, link = create_reset_for_user(db, user)
    body = (
        f"Habari {user.full_name},\n\n"
        f"Ombi la kubadilisha nenosiri la akaunti yako ya Madrasa.\n\n"
        f"Bofya kiungo hiki (kinaisha baada ya saa 2):\n{link}\n\n"
        f"Ikiwa hukuomba, puuza ujumbe huu.\n\n"
        f"— Madrasatul Habiib El Mustwafaa El Mustwafaa"
    )
    sent = send_email(user.email, "Badilisha nenosiri — Madrasa", body)
    out = dict(ok)
    if not sent:
        out["dev_reset_link"] = link
        out["hint"] = "SMTP haijasanidiwa au imeshindwa — tumia dev_reset_link kwa majaribio"
    return out


@router.post("/reset-password")
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)):
    row = db.query(PasswordResetToken).filter(PasswordResetToken.token == payload.token).first()
    if not row or row.used:
        raise HTTPException(status_code=400, detail="Token si sahihi au imetumika")
    exp = row.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token imeisha muda")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Mtumiaji hakupatikana")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Nenosiri jipya liwe na herufi 6+")
    user.hashed_password = hash_password(payload.new_password)
    row.used = True
    db.commit()
    return {"detail": "Nenosiri limebadilishwa. Unaweza kuingia sasa."}

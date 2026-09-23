from app.core.rate_limit import limiter
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Request, APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.db.session import get_db
from app.models.user import User, UserRole, StudentProfile
from app.models.committee import RegistrationRequest, RegistrationStatus
from app.models.fees import PasswordResetToken
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserOut
from app.schemas.registration import RegistrationOut
from app.schemas.fees import ForgotPasswordIn, ResetPasswordIn

router = APIRouter(prefix="/auth", tags=["auth"])

UPLOAD_REG = Path("uploads/registrations")
UPLOAD_REG.mkdir(parents=True, exist_ok=True)



def _save_photo(file: UploadFile, folder: Path) -> str:
    from app.core.uploads import save_image_upload
    return save_image_upload(file, folder)


@router.post("/register", response_model=RegistrationOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str | None = Form(None),
    class_name: str = Form("Darasa la 1"),
    guardian_name: str | None = Form(None),
    guardian_phone: str | None = Form(None),
    address: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    email_n = email.lower().strip()
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Nenosiri liwe na herufi 6+")
    if db.query(User).filter(User.email == email_n).first():
        raise HTTPException(status_code=400, detail="Barua pepe tayari inatumika")
    pending = (
        db.query(RegistrationRequest)
        .filter(RegistrationRequest.email == email_n, RegistrationRequest.status == RegistrationStatus.pending)
        .first()
    )
    if pending:
        raise HTTPException(status_code=400, detail="Ombi lako bado linasubiri idhini ya Kamati")

    photo_url = None
    if photo and photo.filename:
        photo_url = _save_photo(photo, UPLOAD_REG)

    req = RegistrationRequest(
        full_name=full_name.strip(),
        email=email_n,
        phone=(phone or "").strip() or None,
        class_name=(class_name or "Darasa la 1").strip(),
        guardian_name=(guardian_name or "").strip() or None,
        guardian_phone=(guardian_phone or "").strip() or None,
        address=(address or "").strip() or None,
        password_hash=hash_password(password),
        status=RegistrationStatus.pending,
        photo_url=photo_url,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(
    request: Request,
    payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = (payload.email or "").strip()
    if not identifier:
        raise HTTPException(status_code=422, detail="Weka namba ya usajili au barua pepe")

    user = None
    profile = db.query(StudentProfile).filter(StudentProfile.student_code == identifier.upper()).first()
    if profile:
        user = db.get(User, profile.user_id)
    else:
        user = db.query(User).filter(User.email == identifier.lower()).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        pending = (
            db.query(RegistrationRequest)
            .filter(RegistrationRequest.email == identifier.lower(), RegistrationRequest.status == RegistrationStatus.pending)
            .first()
        )
        if pending:
            raise HTTPException(status_code=403, detail="Ombi linasubiri idhini. Baada ya idhini ingia kwa namba ya usajili.")
        raise HTTPException(status_code=401, detail="Namba/barua pepe au nenosiri si sahihi")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akaunti haijaamilishwa.")

    if user.role == UserRole.student and not profile:
        raise HTTPException(status_code=401, detail="Wanafunzi wanaingia kwa namba ya usajili, si barua pepe.")

    token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(access_token=token, token_type="bearer", user=user)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


def _send_email(to: str, subject: str, body: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        return False
    import smtplib
    from email.message import EmailMessage
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = to
    msg.set_content(body)
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as s:
        s.starttls()
        s.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        s.send_message(msg)
    return True


def _send_whatsapp(phone: str, text: str) -> bool:
    url = (settings.WHATSAPP_API_URL or "").strip()
    if not url:
        return False
    import urllib.parse
    import urllib.request
    phone_n = "".join(c for c in phone if c.isdigit() or c == "+")
    final = url.replace("{phone}", urllib.parse.quote(phone_n)).replace("{text}", urllib.parse.quote(text))
    try:
        urllib.request.urlopen(final, timeout=15)
        return True
    except Exception:
        return False


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    ident = payload.identifier.strip()
    user = None
    sp = db.query(StudentProfile).filter(StudentProfile.student_code == ident.upper()).first()
    if sp:
        user = db.get(User, sp.user_id)
    else:
        user = db.query(User).filter(User.email == ident.lower()).first()

    # Always same message (no user enumeration)
    msg_ok = {"detail": "Ikiwa akaunti ipo, tumekutumia maelekezo ya kubadilisha nenosiri."}
    if not user:
        return msg_ok

    token = secrets.token_urlsafe(32)
    row = PasswordResetToken(
        user_id=user.id,
        token=token,
        channel=payload.channel if payload.channel in ("email", "whatsapp") else "email",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=2),
    )
    db.add(row)
    db.commit()

    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    body = f"Habari {user.full_name},\n\nBadilisha nenosiri hapa (inaisha baada ya saa 2):\n{link}\n\nMadrasatul Habiib El Mustwafaa El Mustwafaa"

    sent = False
    if payload.channel == "whatsapp" and user.phone:
        sent = _send_whatsapp(user.phone, body)
    else:
        sent = _send_email(user.email, "Badilisha nenosiri — Madrasa", body)

    # Dev fallback: return token when no provider configured
    out = dict(msg_ok)
    if not sent:
        out["dev_reset_link"] = link
        out["hint"] = "SMTP/WhatsApp hazijawekwa — tumia kiungo cha dev_reset_link"
    return out


@router.post("/reset-password")
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)):
    row = db.query(PasswordResetToken).filter(PasswordResetToken.token == payload.token).first()
    if not row or row.used:
        raise HTTPException(status_code=400, detail="Token si sahihi au imetumika")
    if row.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token imeisha muda")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Mtumiaji hakupatikana")
    user.hashed_password = hash_password(payload.new_password)
    row.used = True
    db.commit()
    return {"detail": "Nenosiri limebadilishwa. Unaweza kuingia sasa."}


from pydantic import BaseModel

class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
def change_password(
    body: ChangePasswordIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Nenosiri la sasa si sahihi")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Nenosiri jipya liwe angalau herufi 6")
    current_user.hashed_password = hash_password(body.new_password)
    db.add(current_user)
    db.commit()
    return {"ok": True, "message": "Nenosiri limebadilishwa"}


class UpdateMeIn(BaseModel):
    full_name: str | None = None
    phone: str | None = None

@router.patch("/me")
def update_me(
    body: UpdateMeIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.full_name is not None and body.full_name.strip():
        current_user.full_name = body.full_name.strip()
    if body.phone is not None:
        current_user.phone = body.phone.strip() or None
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
    }

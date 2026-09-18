"""Registration requests + CSV import for committee."""
import csv
import io
import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, UserRole, StudentProfile
from app.models.committee import RegistrationRequest, RegistrationStatus
from app.schemas.registration import (
    RegistrationOut,
    RegistrationApprove,
    RegistrationReject,
    CsvImportResult,
)

router = APIRouter(prefix="/committee", tags=["committee-registrations"])
require_committee = require_role(UserRole.committee, UserRole.admin)


def _gen_student_code(db: Session) -> str:
    for _ in range(30):
        code = "STU" + "".join(random.choices(string.digits, k=5))
        if not db.query(StudentProfile).filter(StudentProfile.student_code == code).first():
            return code
    return "STU" + "".join(random.choices(string.digits, k=8))


@router.get("/registrations", response_model=list[RegistrationOut])
def list_registrations(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    q = db.query(RegistrationRequest).order_by(RegistrationRequest.created_at.desc())
    if status_filter:
        try:
            st = RegistrationStatus(status_filter)
            q = q.filter(RegistrationRequest.status == st)
        except ValueError:
            pass
    return q.all()


@router.post("/registrations/{request_id}/approve", response_model=RegistrationOut)
def approve_registration(
    request_id: str,
    payload: RegistrationApprove,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    req = db.get(RegistrationRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Ombi halijapatikana")
    if req.status != RegistrationStatus.pending:
        raise HTTPException(status_code=400, detail="Ombi halipo pending")

    code = payload.student_code.strip().upper()
    if db.query(StudentProfile).filter(StudentProfile.student_code == code).first():
        raise HTTPException(status_code=400, detail="Namba ya usajili tayari inatumika")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Barua pepe tayari ina akaunti")

    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=req.password_hash,
        role=UserRole.student,
        phone=req.phone,
        avatar_url=getattr(req, 'photo_url', None),
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.add(
        StudentProfile(
            user_id=user.id,
            student_code=code,
            class_name=req.class_name or "Darasa la 1",
            date_of_birth=req.date_of_birth,
            guardian_name=req.guardian_name,
            guardian_phone=req.guardian_phone,
            address=req.address,
        )
    )
    req.status = RegistrationStatus.approved
    req.student_code = code
    req.reviewed_by_id = current.id
    req.reviewed_at = datetime.now(timezone.utc)
    req.created_user_id = user.id
    db.commit()
    db.refresh(req)
    return req


@router.post("/registrations/{request_id}/reject", response_model=RegistrationOut)
def reject_registration(
    request_id: str,
    payload: RegistrationReject,
    db: Session = Depends(get_db),
    current: User = Depends(require_committee),
):
    req = db.get(RegistrationRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Ombi halijapatikana")
    if req.status != RegistrationStatus.pending:
        raise HTTPException(status_code=400, detail="Ombi haliipo pending")
    req.status = RegistrationStatus.rejected
    req.rejection_reason = (payload.reason or "").strip() or None
    req.reviewed_by_id = current.id
    req.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)
    return req


@router.post("/students/import-csv", response_model=CsvImportResult)
async def import_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    """
    CSV headers:
    full_name,email,phone,class_name,student_code,password,guardian_name,guardian_phone
    password tupu => Student@123
    student_code tupu => auto STU#####
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Pakia faili ya .csv")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV haina vichwa vya kolamu")

    def norm(h: str) -> str:
        return (h or "").strip().lower().replace(" ", "_")

    created = 0
    skipped = 0
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):
        data = {norm(k): (v or "").strip() for k, v in row.items() if k is not None}
        full_name = data.get("full_name") or data.get("name") or ""
        email = (data.get("email") or "").lower()
        if not full_name or not email:
            errors.append(f"Mstari {i}: full_name/email vinahitajika")
            skipped += 1
            continue
        if db.query(User).filter(User.email == email).first():
            errors.append(f"Mstari {i}: {email} tayari ipo")
            skipped += 1
            continue
        code = (data.get("student_code") or data.get("registration_number") or "").upper()
        if not code:
            code = _gen_student_code(db)
        elif db.query(StudentProfile).filter(StudentProfile.student_code == code).first():
            errors.append(f"Mstari {i}: student_code {code} tayari ipo")
            skipped += 1
            continue
        pwd = data.get("password") or "Student@123"
        class_name = data.get("class_name") or data.get("class") or "Darasa la 1"
        try:
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=hash_password(pwd),
                role=UserRole.student,
                phone=data.get("phone") or None,
                is_active=True,
            )
            db.add(user)
            db.flush()
            db.add(
                StudentProfile(
                    user_id=user.id,
                    student_code=code,
                    class_name=class_name,
                    guardian_name=data.get("guardian_name") or None,
                    guardian_phone=data.get("guardian_phone") or None,
                    address=data.get("address") or None,
                )
            )
            created += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Mstari {i}: {e}")
            skipped += 1
    db.commit()
    return CsvImportResult(created=created, skipped=skipped, errors=errors[:50])

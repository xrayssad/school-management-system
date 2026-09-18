from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole, StudentProfile
from app.models.fees import StudentFee, FeeStatus
from app.schemas.fees import StudentFeeOut, FeeGenerateIn, FeeMarkPaidIn

router = APIRouter(prefix="/fees", tags=["fees"])
require_committee = require_role(UserRole.committee, UserRole.admin)


def _out(db: Session, f: StudentFee) -> StudentFeeOut:
    u = db.get(User, f.student_user_id)
    sp = u.student_profile if u else None
    return StudentFeeOut(
        id=f.id,
        student_user_id=f.student_user_id,
        student_name=u.full_name if u else "",
        student_code=sp.student_code if sp else "",
        class_name=sp.class_name if sp else "",
        phone=u.phone if u else None,
        photo_url=u.avatar_url if u else None,
        month=f.month,
        amount=float(f.amount),
        status=f.status,
        notes=f.notes,
        paid_at=f.paid_at,
        created_at=f.created_at,
    )


@router.get("/committee", response_model=list[StudentFeeOut])
def list_fees_committee(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    class_name: str | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    q = db.query(StudentFee).filter(StudentFee.month == month)
    if status_filter:
        try:
            q = q.filter(StudentFee.status == FeeStatus(status_filter))
        except ValueError:
            pass
    rows = q.order_by(StudentFee.created_at.desc()).all()
    out = [_out(db, r) for r in rows]
    if class_name:
        out = [x for x in out if x.class_name == class_name]
    return out


@router.post("/committee/generate", response_model=dict)
def generate_fees(body: FeeGenerateIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    q = db.query(User).join(StudentProfile, User.id == StudentProfile.user_id).filter(User.role == UserRole.student, User.is_active == True)  # noqa
    users = q.all()
    if body.class_name:
        users = [u for u in users if u.student_profile and u.student_profile.class_name == body.class_name]
    created = 0
    skipped = 0
    for u in users:
        exists = db.query(StudentFee).filter(StudentFee.student_user_id == u.id, StudentFee.month == body.month).first()
        if exists:
            skipped += 1
            continue
        db.add(StudentFee(student_user_id=u.id, month=body.month, amount=body.amount, status=FeeStatus.unpaid))
        created += 1
    db.commit()
    return {"created": created, "skipped": skipped}


@router.post("/committee/{fee_id}/mark-paid", response_model=StudentFeeOut)
def mark_paid(fee_id: str, body: FeeMarkPaidIn, db: Session = Depends(get_db), current: User = Depends(require_committee)):
    f = db.get(StudentFee, fee_id)
    if not f:
        raise HTTPException(status_code=404, detail="Rekodi haipo")
    f.status = FeeStatus.paid
    f.paid_at = date.today()
    f.notes = body.notes
    f.recorded_by_id = current.id
    db.commit()
    db.refresh(f)
    return _out(db, f)


@router.get("/me", response_model=list[StudentFeeOut])
def my_fees(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    if current.role != UserRole.student:
        raise HTTPException(status_code=400, detail="Kwa wanafunzi tu")
    rows = db.query(StudentFee).filter(StudentFee.student_user_id == current.id).order_by(StudentFee.month.desc()).all()
    return [_out(db, r) for r in rows]

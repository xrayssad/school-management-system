from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.security import verify_password, hash_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserUpdate, PasswordChange

router = APIRouter(prefix="/users", tags=["users"])


@router.put("/me", response_model=UserOut)
def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    if current_user.role == UserRole.student and current_user.student_profile:
        sp = current_user.student_profile
        if payload.guardian_name is not None:
            sp.guardian_name = payload.guardian_name
        if payload.guardian_phone is not None:
            sp.guardian_phone = payload.guardian_phone
        if payload.address is not None:
            sp.address = payload.address

    if current_user.role == UserRole.teacher and current_user.teacher_profile:
        tp = current_user.teacher_profile
        if payload.specialization is not None:
            tp.specialization = payload.specialization
        if payload.bio is not None:
            tp.bio = payload.bio
        if payload.experience_years is not None:
            tp.experience_years = payload.experience_years

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
def change_password(payload: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated successfully"}


@router.get("", response_model=list[UserOut], dependencies=[Depends(require_admin)])
def list_users(role: UserRole | None = None, db: Session = Depends(get_db)):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.full_name).all()

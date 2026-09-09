from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, TeacherProfile
from app.schemas.user import UserOut

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=list[UserOut])
def list_teachers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(User)
        .join(TeacherProfile, User.id == TeacherProfile.user_id)
        .order_by(User.full_name)
        .all()
    )

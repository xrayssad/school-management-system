from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_teacher
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.schemas.user import UserOut

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[UserOut], dependencies=[Depends(require_teacher)])
def list_students(class_name: str | None = None, db: Session = Depends(get_db)):
    q = db.query(User).join(StudentProfile, User.id == StudentProfile.user_id)
    if class_name:
        q = q.filter(StudentProfile.class_name == class_name)
    return q.order_by(User.full_name).all()


# /classes moved to committee_classes.py


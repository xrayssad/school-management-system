from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.communication import Announcement
from app.models.user import User
from app.schemas.communication import AnnouncementOut, AnnouncementCreate

router = APIRouter(prefix="/announcements", tags=["announcements"])


def _serialize(a: Announcement) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "message": a.message,
        "teacher_id": a.teacher_id,
        "teacher_name": a.teacher_profile.user.full_name if getattr(a, "teacher_profile", None) else None,
        "subject_id": a.subject_id,
        "class_name": a.class_name,
        "priority": a.priority,
        "created_at": a.created_at,
    }


@router.get("", response_model=list[AnnouncementOut])
def list_announcements(class_name: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Announcement)
    target_class = class_name or (current_user.student_profile.class_name if current_user.student_profile else None)
    if target_class:
        q = q.filter((Announcement.class_name == target_class) | (Announcement.class_name.is_(None)))
    items = q.order_by(Announcement.created_at.desc()).all()
    result = []
    for a in items:
        teacher_name = None
        if a.teacher_id:
            from app.models.user import TeacherProfile
            tp = db.get(TeacherProfile, a.teacher_id)
            if tp:
                teacher_name = tp.user.full_name
        result.append({
            "id": a.id, "title": a.title, "message": a.message, "teacher_id": a.teacher_id,
            "teacher_name": teacher_name, "subject_id": a.subject_id, "class_name": a.class_name,
            "priority": a.priority, "created_at": a.created_at,
        })
    return result


@router.post("", response_model=AnnouncementOut, dependencies=[Depends(require_teacher)])
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teacher_id = current_user.teacher_profile.id if current_user.teacher_profile else None
    a = Announcement(**payload.model_dump(), teacher_id=teacher_id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {
        "id": a.id, "title": a.title, "message": a.message, "teacher_id": a.teacher_id,
        "teacher_name": current_user.full_name, "subject_id": a.subject_id, "class_name": a.class_name,
        "priority": a.priority, "created_at": a.created_at,
    }

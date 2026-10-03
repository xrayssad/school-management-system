from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.communication import Announcement
from app.models.user import User, UserRole, TeacherProfile
from app.schemas.communication import AnnouncementCreate

router = APIRouter(prefix="/announcements", tags=["announcements"])

_ATTACH_COLS = "attachment_url, attachment_name, attachment_type, audience"
_BASE_COLS = "id, title, message, teacher_id, subject_id, class_name, priority, created_at"


def relative_media_path(url: str | None) -> str | None:
    """Strip origin (localhost/127.0.0.1/prod) so the frontend can rebuild the host."""
    if not url:
        return None
    value = str(url).strip()
    if not value:
        return None
    if value.startswith("http://") or value.startswith("https://"):
        from urllib.parse import urlparse

        parsed = urlparse(value)
        path = parsed.path or ""
        return f"{path}?{parsed.query}" if parsed.query else path
    return value if value.startswith("/") else f"/{value}"


def _fetch_rows(db: Session) -> list:
    try:
        return (
            db.execute(
                text(
                    f"""
                    SELECT {_BASE_COLS}, {_ATTACH_COLS}
                    FROM announcements
                    ORDER BY created_at DESC NULLS LAST
                    LIMIT 100
                    """
                )
            )
            .mappings()
            .all()
        )
    except Exception:
        db.rollback()
        return (
            db.execute(
                text(
                    f"""
                    SELECT {_BASE_COLS}
                    FROM announcements
                    ORDER BY created_at DESC NULLS LAST
                    LIMIT 100
                    """
                )
            )
            .mappings()
            .all()
        )


@router.get("")
def list_announcements(
    class_name: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return announcements including attachment_* from DB (raw SQL)."""
    rows = _fetch_rows(db)

    target_class = class_name
    if not target_class and getattr(current_user, "student_profile", None):
        target_class = current_user.student_profile.class_name

    result = []
    for r in rows:
        d = dict(r)
        # class filter: show if null class or matches student class
        cn = d.get("class_name")
        if target_class and cn and cn != target_class:
            continue
        aud = (d.get("audience") or "all") or "all"
        aud = str(aud).lower()
        if current_user.role == UserRole.student and aud == "teachers":
            continue
        if current_user.role == UserRole.teacher and aud == "students":
            continue

        teacher_name = None
        if d.get("teacher_id"):
            tp = db.get(TeacherProfile, d["teacher_id"])
            if tp is not None and getattr(tp, "user", None) is not None:
                teacher_name = tp.user.full_name

        result.append(
            {
                "id": d["id"],
                "title": d["title"],
                "message": d["message"],
                "teacher_id": d.get("teacher_id"),
                "teacher_name": teacher_name,
                "subject_id": d.get("subject_id"),
                "class_name": d.get("class_name"),
                "priority": d.get("priority") or "normal",
                "attachment_url": relative_media_path(d.get("attachment_url")),
                "attachment_name": d.get("attachment_name"),
                "attachment_type": d.get("attachment_type"),
                "audience": d.get("audience") or "all",
                "created_at": d.get("created_at"),
            }
        )
    return result


@router.post("", dependencies=[Depends(require_teacher)])
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teacher_id = current_user.teacher_profile.id if current_user.teacher_profile else None
    a = Announcement(**payload.model_dump(), teacher_id=teacher_id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {
        "id": a.id,
        "title": a.title,
        "message": a.message,
        "teacher_id": a.teacher_id,
        "teacher_name": current_user.full_name,
        "subject_id": getattr(a, "subject_id", None),
        "class_name": getattr(a, "class_name", None),
        "priority": a.priority,
        "attachment_url": relative_media_path(getattr(a, "attachment_url", None)),
        "attachment_name": getattr(a, "attachment_name", None),
        "attachment_type": getattr(a, "attachment_type", None),
        "audience": getattr(a, "audience", None) or "all",
        "created_at": a.created_at,
    }

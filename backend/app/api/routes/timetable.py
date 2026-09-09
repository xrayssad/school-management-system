from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.academic import TimetableEntry
from app.models.user import User, TeacherProfile
from app.schemas.academic import TimetableEntryOut, TimetableEntryCreate

router = APIRouter(prefix="/timetable", tags=["timetable"])


def _serialize(entry: TimetableEntry, db: Session) -> dict:
    teacher_name = None
    if entry.teacher_id:
        tp = db.get(TeacherProfile, entry.teacher_id)
        if tp:
            teacher_name = tp.user.full_name
    return {
        "id": entry.id,
        "day_of_week": entry.day_of_week,
        "class_name": entry.class_name,
        "subject": entry.subject,
        "teacher_id": entry.teacher_id,
        "teacher_name": teacher_name,
        "start_time": entry.start_time,
        "end_time": entry.end_time,
        "room": entry.room,
        "entry_type": entry.entry_type,
    }


@router.get("", response_model=list[TimetableEntryOut])
def get_timetable(class_name: str | None = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(TimetableEntry)
    if class_name:
        q = q.filter(TimetableEntry.class_name == class_name)
    entries = q.all()
    order = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
    entries.sort(key=lambda e: (order.get(e.day_of_week, 9), e.start_time))
    return [_serialize(e, db) for e in entries]


@router.post("", response_model=TimetableEntryOut, dependencies=[Depends(require_teacher)])
def create_entry(payload: TimetableEntryCreate, db: Session = Depends(get_db)):
    entry = TimetableEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _serialize(entry, db)

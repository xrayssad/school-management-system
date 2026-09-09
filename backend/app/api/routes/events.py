from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.communication import Event
from app.schemas.communication import EventOut, EventCreate

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Event).order_by(Event.event_date.asc()).all()


@router.post("", response_model=EventOut, dependencies=[Depends(require_teacher)])
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    e = Event(**payload.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e

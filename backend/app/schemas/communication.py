from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    subject_id: str | None = None
    class_name: str | None = None
    priority: str = "normal"


class AnnouncementOut(BaseModel):
    id: str
    title: str
    message: str
    teacher_id: str | None = None
    teacher_name: str | None = None
    subject_id: str | None = None
    class_name: str | None = None
    priority: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    event_date: date
    location: str | None = None
    category: str = "general"
    image_url: str | None = None


class EventOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    event_date: date
    location: str | None = None
    category: str
    image_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    recipient_id: str
    subject: str = ""
    body: str


class MessageOut(BaseModel):
    id: str
    sender_id: str
    sender_name: str | None = None
    recipient_id: str
    recipient_name: str | None = None
    subject: str
    body: str
    is_read: bool
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)

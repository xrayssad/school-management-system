from pydantic import BaseModel, ConfigDict


class SubjectOut(BaseModel):
    id: str
    name: str
    code: str
    color: str
    icon: str

    model_config = ConfigDict(from_attributes=True)


class SubjectCreate(BaseModel):
    name: str
    code: str
    color: str = "#2E7D32"
    icon: str = "📖"


class TimetableEntryOut(BaseModel):
    id: str
    day_of_week: str
    class_name: str
    subject: SubjectOut | None = None
    teacher_id: str | None = None
    teacher_name: str | None = None
    start_time: str
    end_time: str
    room: str | None = None
    entry_type: str

    model_config = ConfigDict(from_attributes=True)


class TimetableEntryCreate(BaseModel):
    day_of_week: str
    class_name: str
    subject_id: str | None = None
    teacher_id: str | None = None
    start_time: str
    end_time: str
    room: str | None = None
    entry_type: str = "lesson"

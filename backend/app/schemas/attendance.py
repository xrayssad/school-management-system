from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.models.attendance import AttendanceStatus


class AttendanceMark(BaseModel):
    student_id: str
    status: AttendanceStatus


class AttendanceBulkCreate(BaseModel):
    class_name: str
    date: date
    records: list[AttendanceMark]


class AttendanceOut(BaseModel):
    id: str
    student_id: str
    class_name: str
    date: date
    status: AttendanceStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttendanceSummary(BaseModel):
    total_days: int
    present: int
    absent: int
    late: int
    excused: int
    percentage: float

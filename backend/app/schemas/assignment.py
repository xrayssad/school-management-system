from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.models.assignment import SubmissionStatus
from app.schemas.academic import SubjectOut


class AssignmentCreate(BaseModel):
    title: str
    description: str | None = None
    subject_id: str | None = None
    class_name: str
    due_date: date
    total_marks: int = 100


class AssignmentOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    subject: SubjectOut | None = None
    class_name: str
    due_date: date
    total_marks: int
    created_at: datetime
    submission_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    content: str | None = None


class SubmissionGrade(BaseModel):
    marks_obtained: float
    feedback: str | None = None


class SubmissionOut(BaseModel):
    id: str
    assignment_id: str
    student_id: str
    content: str | None = None
    status: SubmissionStatus
    marks_obtained: float | None = None
    feedback: str | None = None
    submitted_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

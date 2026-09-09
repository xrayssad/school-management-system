from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.academic import SubjectOut


class ExamCreate(BaseModel):
    title: str
    subject_id: str | None = None
    class_name: str
    exam_date: date
    total_marks: int = 100


class ExamOut(BaseModel):
    id: str
    title: str
    subject: SubjectOut | None = None
    class_name: str
    exam_date: date
    total_marks: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GradeCreate(BaseModel):
    exam_id: str
    student_id: str
    marks_obtained: float
    remarks: str | None = None


class GradeOut(BaseModel):
    id: str
    exam_id: str
    student_id: str
    marks_obtained: float
    grade_letter: str
    remarks: str | None = None
    graded_at: datetime
    exam: ExamOut | None = None

    model_config = ConfigDict(from_attributes=True)

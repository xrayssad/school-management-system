from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr


class CommitteeAnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    target_class_id: str | None = None


class CommitteeAnnouncementOut(BaseModel):
    id: str
    title: str
    content: str
    target_class_id: str | None = None
    target_class_name: str | None = None
    created_by: str
    created_at: datetime
    reach_count: int


class TeacherCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=6)


class TeacherItemOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    subjects: list[str]
    classes: list[str]


class TeacherAssignmentCreate(BaseModel):
    teacher_id: str
    subject_id: str
    class_id: str


class TeacherAssignmentOut(BaseModel):
    id: str
    teacher_id: str
    subject_id: str
    subject_name: str
    class_id: str
    class_name: str


class SalaryCreate(BaseModel):
    teacher_id: str
    amount: float = Field(gt=0)
    month: str
    paid_at: date
    notes: str = ""


class SalaryOut(BaseModel):
    id: str
    teacher_id: str
    teacher_name: str
    amount: float
    month: str
    paid_at: date
    notes: str


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    category: str
    month: str
    description: str = ""
    recorded_at: date


class ExpenseOut(BaseModel):
    id: str
    amount: float
    category: str
    month: str
    description: str
    recorded_at: date


class CollectionCreate(BaseModel):
    amount: float = Field(gt=0)
    source: str
    month: str
    recorded_at: date


class CollectionOut(BaseModel):
    id: str
    amount: float
    source: str
    month: str
    recorded_at: date


class FinanceSummaryOut(BaseModel):
    month: str
    total_salaries: float
    total_expenses: float
    total_collections: float
    balance: float


class SchoolClassOut(BaseModel):
    id: str
    name: str
    student_count: int


class SubjectItemOut(BaseModel):
    id: str
    name: str


class StudentItemOut(BaseModel):
    id: str
    full_name: str
    date_of_birth: str
    parent_name: str
    parent_phone: str
    class_name: str


class ExamScheduleCreate(BaseModel):
    subject_id: str
    class_id: str
    exam_date: date
    start_time: str
    end_time: str
    room: str


class ExamScheduleOut(BaseModel):
    id: str
    subject_id: str
    subject_name: str
    class_id: str
    class_name: str
    exam_date: date
    start_time: str
    end_time: str
    room: str
    status: str


class TimetableCreate(BaseModel):
    subject_id: str
    teacher_id: str
    class_id: str
    day_of_week: int = Field(ge=0, le=6)
    start_time: str
    end_time: str


class TimetableOut(BaseModel):
    id: str
    subject_id: str
    subject_name: str
    teacher_id: str
    teacher_name: str
    class_id: str
    class_name: str
    day_of_week: int
    day_name: str
    start_time: str
    end_time: str
    status: str


class CommitteeDashboardOut(BaseModel):
    total_students: int
    total_teachers: int
    month_collections: float
    month_expenses: float
    recent_announcements: list[dict]

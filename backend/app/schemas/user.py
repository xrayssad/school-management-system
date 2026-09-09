from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.user import UserRole


class StudentProfileOut(BaseModel):
    id: str
    student_code: str
    class_name: str
    date_of_birth: date | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    address: str | None = None
    enrollment_date: date

    model_config = ConfigDict(from_attributes=True)


class TeacherProfileOut(BaseModel):
    id: str
    staff_code: str
    specialization: str | None = None
    experience_years: int
    bio: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    phone: str | None = None
    avatar_url: str | None = None
    is_active: bool
    created_at: datetime
    student_profile: StudentProfileOut | None = None
    teacher_profile: TeacherProfileOut | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    # student-only
    guardian_name: str | None = None
    guardian_phone: str | None = None
    address: str | None = None
    # teacher-only
    specialization: str | None = None
    bio: str | None = None
    experience_years: int | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

from datetime import date
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole
from app.schemas.user import UserOut


class LoginRequest(BaseModel):
    # Email (walimu/kamati) AU namba ya usajili (wanafunzi)
    email: str  # field name kept for frontend compat; value may be student_code
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.student
    phone: str | None = None
    # student fields
    class_name: str | None = None
    date_of_birth: date | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    # teacher fields
    specialization: str | None = None
    experience_years: int | None = 0


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

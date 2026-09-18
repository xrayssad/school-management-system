from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.committee import RegistrationStatus


class RegistrationCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: Optional[str] = None
    class_name: str = "Darasa la 1"
    date_of_birth: Optional[date] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    address: Optional[str] = None


class RegistrationOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    class_name: str
    date_of_birth: Optional[date] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
    status: RegistrationStatus
    student_code: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RegistrationApprove(BaseModel):
    student_code: str = Field(min_length=3, max_length=20)


class RegistrationReject(BaseModel):
    reason: Optional[str] = None


class CsvImportResult(BaseModel):
    created: int
    skipped: int
    errors: list[str]

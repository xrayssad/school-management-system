from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.fees import FeeStatus

class StudentFeeOut(BaseModel):
    id: str
    student_user_id: str
    student_name: str = ""
    student_code: str = ""
    class_name: str = ""
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    month: str
    amount: float
    status: FeeStatus
    notes: Optional[str] = None
    paid_at: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FeeGenerateIn(BaseModel):
    month: str = Field(pattern=r"^\d{4}-\d{2}$")
    amount: float = Field(gt=0)
    class_name: Optional[str] = None  # null = all classes

class FeeMarkPaidIn(BaseModel):
    notes: Optional[str] = None

class ForgotPasswordIn(BaseModel):
    identifier: str  # email or student_code
    channel: str = "email"  # email | whatsapp

class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

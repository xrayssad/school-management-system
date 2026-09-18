
import enum
import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Enum, ForeignKey, Date, Numeric, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class FeeStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    waived = "waived"

class StudentFee(Base):
    """Ada ya mwanafunzi kwa mwezi."""
    __tablename__ = "student_fees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    student_user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    month: Mapped[str] = mapped_column(String(7), index=True)  # YYYY-MM
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[FeeStatus] = mapped_column(Enum(FeeStatus, name="fee_status"), default=FeeStatus.unpaid, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    paid_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    recorded_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    channel: Mapped[str] = mapped_column(String(20), default="email")  # email | whatsapp
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

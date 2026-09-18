import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class GradeScale(Base):
    """Mipaka ya A/B/C/D/F kwa darasa (asilimia)."""
    __tablename__ = "grade_scales"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    class_name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    min_a: Mapped[float] = mapped_column(Float, default=75)
    min_b: Mapped[float] = mapped_column(Float, default=65)
    min_c: Mapped[float] = mapped_column(Float, default=50)
    min_d: Mapped[float] = mapped_column(Float, default=40)
    # chini ya min_d = F
    min_promote_average: Mapped[float] = mapped_column(Float, default=40)
    fail_letter: Mapped[str] = mapped_column(String(5), default="D")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

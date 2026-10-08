import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class ClassSubject(Base):
    """Uhusiano: somo linatolewa katika darasa gani."""
    __tablename__ = "class_subjects"
    __table_args__ = (
        UniqueConstraint("class_name", "subject_id", name="uq_class_subject"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    class_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subject_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

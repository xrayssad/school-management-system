from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    color: Mapped[str] = mapped_column(String(20), default="#2E7D32")
    icon: Mapped[str] = mapped_column(String(10), default="📖")


class TeacherSubject(Base):
    """Which subjects a teacher teaches."""
    __tablename__ = "teacher_subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    teacher_id: Mapped[str] = mapped_column(ForeignKey("teacher_profiles.id", ondelete="CASCADE"))
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    day_of_week: Mapped[str] = mapped_column(String(20))  # Monday..Friday
    class_name: Mapped[str] = mapped_column(String(100))
    subject_id: Mapped[str | None] = mapped_column(ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    teacher_id: Mapped[str | None] = mapped_column(ForeignKey("teacher_profiles.id", ondelete="SET NULL"), nullable=True)
    start_time: Mapped[str] = mapped_column(String(10))
    end_time: Mapped[str] = mapped_column(String(10))
    room: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entry_type: Mapped[str] = mapped_column(String(30), default="lesson")  # lesson, break, prayer, workshop

    subject: Mapped["Subject"] = relationship()

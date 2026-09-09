from datetime import date, datetime

from sqlalchemy import String, ForeignKey, Integer, Date, DateTime, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    title: Mapped[str] = mapped_column(String(255))
    subject_id: Mapped[str | None] = mapped_column(ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    teacher_id: Mapped[str | None] = mapped_column(ForeignKey("teacher_profiles.id", ondelete="SET NULL"), nullable=True)
    class_name: Mapped[str] = mapped_column(String(100))
    exam_date: Mapped[date] = mapped_column(Date)
    total_marks: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    subject: Mapped["Subject"] = relationship()
    grades: Mapped[list["Grade"]] = relationship(back_populates="exam", cascade="all, delete-orphan")


class Grade(Base):
    __tablename__ = "grades"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id", ondelete="CASCADE"))
    student_id: Mapped[str] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"))
    marks_obtained: Mapped[float] = mapped_column(Float)
    grade_letter: Mapped[str] = mapped_column(String(5), default="")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    graded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    exam: Mapped["Exam"] = relationship(back_populates="grades")


def compute_grade_letter(marks: float, total: float) -> str:
    if total <= 0:
        return "N/A"
    pct = (marks / total) * 100
    if pct >= 90:
        return "A+"
    if pct >= 80:
        return "A"
    if pct >= 75:
        return "A-"
    if pct >= 70:
        return "B+"
    if pct >= 65:
        return "B"
    if pct >= 60:
        return "B-"
    if pct >= 50:
        return "C"
    if pct >= 40:
        return "D"
    return "F"

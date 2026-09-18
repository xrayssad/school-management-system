import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, Integer, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class ClassPromotionRule(Base):
    """Wastani wa chini wa kupandishwa + alama ya D kwa term 2."""
    __tablename__ = "class_promotion_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    class_name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    min_average: Mapped[float] = mapped_column(Float, default=40.0)  # wastani wa chini
    fail_grade: Mapped[str] = mapped_column(String(5), default="D")  # grade inayosababisha kurudishwa term 2
    repeat_on_term2_fail: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

class ExamReportFile(Base):
    """PDF zilizotengenezwa na Kamati."""
    __tablename__ = "exam_report_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    title: Mapped[str] = mapped_column(String(255))
    report_type: Mapped[str] = mapped_column(String(50))  # evaluation | ranking
    exam_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    term: Mapped[str | None] = mapped_column(String(50), nullable=True)
    file_url: Mapped[str] = mapped_column(String(500))
    created_by_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ManualExamEvaluation(Base):
    """Tathmini ya mkono kwa darasa (Kamati)."""
    __tablename__ = "manual_exam_evaluations"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    term: Mapped[str] = mapped_column(String(50), index=True)
    class_name: Mapped[str] = mapped_column(String(100), index=True)
    registered: Mapped[int] = mapped_column(Integer, default=0)
    completed_all: Mapped[int] = mapped_column(Integer, default=0)
    missed_some: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

class ManualBestStudent(Base):
    """Mwanafunzi bora kwa somo/darasa — Kamati inaweka kwa mkono."""
    __tablename__ = "manual_best_students"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    term: Mapped[str] = mapped_column(String(50), index=True)
    class_name: Mapped[str] = mapped_column(String(100))
    subject_name: Mapped[str] = mapped_column(String(100))
    student_name: Mapped[str] = mapped_column(String(255))
    student_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

class ManualSchoolTop(Base):
    __tablename__ = "manual_school_tops"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    term: Mapped[str] = mapped_column(String(50), index=True)
    position: Mapped[int] = mapped_column(Integer)  # 1,2,3
    student_name: Mapped[str] = mapped_column(String(255))
    student_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    class_name: Mapped[str] = mapped_column(String(100))
    average: Mapped[float] = mapped_column(Float, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ManualClassBest(Base):
    """Mwanafunzi bora wa darasa kwa wastani (si kwa somo)."""
    __tablename__ = "manual_class_bests"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    term: Mapped[str] = mapped_column(String(50), index=True)
    class_name: Mapped[str] = mapped_column(String(100), index=True)
    position: Mapped[int] = mapped_column(Integer, default=1)  # 1, 2, 3 within class
    student_name: Mapped[str] = mapped_column(String(255))
    student_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    average: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

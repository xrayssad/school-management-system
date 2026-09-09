from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.user import User
from app.schemas.attendance import AttendanceOut, AttendanceBulkCreate, AttendanceSummary

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/bulk", response_model=list[AttendanceOut], dependencies=[Depends(require_teacher)])
def mark_attendance(payload: AttendanceBulkCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teacher_id = current_user.teacher_profile.id if current_user.teacher_profile else None
    results = []
    for record in payload.records:
        existing = (
            db.query(Attendance)
            .filter(Attendance.student_id == record.student_id, Attendance.date == payload.date)
            .first()
        )
        if existing:
            existing.status = record.status
            existing.marked_by = teacher_id
            results.append(existing)
        else:
            a = Attendance(
                student_id=record.student_id,
                class_name=payload.class_name,
                date=payload.date,
                status=record.status,
                marked_by=teacher_id,
            )
            db.add(a)
            results.append(a)
    db.commit()
    for r in results:
        db.refresh(r)
    return results


@router.get("/class/{class_name}", response_model=list[AttendanceOut], dependencies=[Depends(require_teacher)])
def class_attendance(class_name: str, date: date_type | None = None, db: Session = Depends(get_db)):
    q = db.query(Attendance).filter(Attendance.class_name == class_name)
    if date:
        q = q.filter(Attendance.date == date)
    return q.all()


@router.get("/me", response_model=list[AttendanceOut])
def my_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students have attendance records")
    return (
        db.query(Attendance)
        .filter(Attendance.student_id == current_user.student_profile.id)
        .order_by(Attendance.date.desc())
        .all()
    )


@router.get("/me/summary", response_model=AttendanceSummary)
def my_attendance_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students have attendance records")
    records = db.query(Attendance).filter(Attendance.student_id == current_user.student_profile.id).all()
    total = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late = sum(1 for r in records if r.status == AttendanceStatus.late)
    excused = sum(1 for r in records if r.status == AttendanceStatus.excused)
    pct = round(((present + late) / total) * 100, 1) if total else 100.0
    return AttendanceSummary(total_days=total, present=present, absent=absent, late=late, excused=excused, percentage=pct)


@router.get("/student/{student_id}/summary", response_model=AttendanceSummary, dependencies=[Depends(require_teacher)])
def student_attendance_summary(student_id: str, db: Session = Depends(get_db)):
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late = sum(1 for r in records if r.status == AttendanceStatus.late)
    excused = sum(1 for r in records if r.status == AttendanceStatus.excused)
    pct = round(((present + late) / total) * 100, 1) if total else 100.0
    return AttendanceSummary(total_days=total, present=present, absent=absent, late=late, excused=excused, percentage=pct)

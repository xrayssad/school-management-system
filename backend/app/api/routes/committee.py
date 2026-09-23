from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_committee,  require_role
from app.core.security import hash_password as hash_password
from app.db.session import get_db
from app.models.user import User, UserRole, StudentProfile, TeacherProfile
from app.models.committee import (
    CommitteeAnnouncement,
    TeacherAssignment,
    SalaryRecord,
    Expense,
    Collection,
    ExamSchedule,
    CommitteeTimetableEntry,
    PublishStatus,
)
from app.schemas.committee import (
    CommitteeAnnouncementCreate,
    CommitteeAnnouncementOut,
    TeacherCreate,
    TeacherItemOut,
    TeacherAssignmentCreate,
    TeacherAssignmentOut,
    SalaryCreate,
    SalaryOut,
    ExpenseCreate,
    ExpenseOut,
    CollectionCreate,
    CollectionOut,
    FinanceSummaryOut,
    SchoolClassOut,
    SubjectItemOut,
    StudentItemOut,
    ExamScheduleCreate,
    ExamScheduleOut,
    TimetableCreate,
    TimetableOut,
    CommitteeDashboardOut,
)

router = APIRouter(prefix="/committee", tags=["committee"])
require_committee = require_role(UserRole.committee, UserRole.admin)
DAY_NAMES = ["Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili"]


def _Subject():
    from app.models.academic import Subject
    return Subject


@router.get("/dashboard", response_model=CommitteeDashboardOut)
def dashboard(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    total_students = db.scalar(select(func.count()).select_from(StudentProfile)) or 0
    total_teachers = db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.teacher)) or 0
    month = datetime.utcnow().strftime("%Y-%m")
    month_collections = float(db.scalar(select(func.coalesce(func.sum(Collection.amount), 0)).where(Collection.month == month)) or 0)
    month_exp = float(db.scalar(select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.month == month)) or 0)
    month_sal = float(db.scalar(select(func.coalesce(func.sum(SalaryRecord.amount), 0)).where(SalaryRecord.month == month)) or 0)
    rows = db.execute(select(CommitteeAnnouncement).order_by(CommitteeAnnouncement.created_at.desc()).limit(5)).scalars().all()
    recent = [{"id": a.id, "title": a.title, "created_at": a.created_at.isoformat() if a.created_at else "", "target_class_name": a.target_class_name} for a in rows]
    return CommitteeDashboardOut(total_students=total_students, total_teachers=total_teachers, month_collections=month_collections, month_expenses=month_exp + month_sal, recent_announcements=recent)


@router.get("/announcements", response_model=list[CommitteeAnnouncementOut])
def list_announcements(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(select(CommitteeAnnouncement).order_by(CommitteeAnnouncement.created_at.desc())).scalars().all()
    out = []
    for a in rows:
        creator = db.get(User, a.created_by_id) if a.created_by_id else None
        out.append(CommitteeAnnouncementOut(id=a.id, title=a.title, content=a.content, target_class_id=a.target_class_name, target_class_name=a.target_class_name, created_by=creator.full_name if creator else "", created_at=a.created_at, reach_count=a.reach_count or 0))
    return out


@router.post("/announcements", response_model=CommitteeAnnouncementOut, status_code=201)
def create_announcement(body: CommitteeAnnouncementCreate, db: Session = Depends(get_db), user: User = Depends(require_committee)):
    target = body.target_class_id.strip() if body.target_class_id else None
    if target:
        reach = db.scalar(select(func.count()).select_from(StudentProfile).where(StudentProfile.class_name == target)) or 0
    else:
        reach = db.scalar(select(func.count()).select_from(StudentProfile)) or 0
    row = CommitteeAnnouncement(title=body.title.strip(), content=body.content.strip(), target_class_name=target, created_by_id=user.id, reach_count=reach)
    db.add(row)
    db.commit()
    db.refresh(row)
    return CommitteeAnnouncementOut(id=row.id, title=row.title, content=row.content, target_class_id=row.target_class_name, target_class_name=row.target_class_name, created_by=user.full_name, created_at=row.created_at, reach_count=row.reach_count)




@router.get("/teachers", response_model=list[TeacherItemOut])
def list_teachers(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    """Walimu + masomo/madarasa — batch (si N+1)."""
    teachers = (
        db.query(User)
        .filter(User.role == UserRole.teacher)
        .order_by(User.full_name)
        .all()
    )
    if not teachers:
        return []

    profile_ids = []
    user_ids = [u.id for u in teachers]
    for u in teachers:
        tp = getattr(u, "teacher_profile", None)
        if tp is not None:
            profile_ids.append(tp.id)

    ids_for_assign = list(set(user_ids) | set(profile_ids))
    all_assigns = []
    if ids_for_assign:
        all_assigns = list(
            db.execute(
                select(TeacherAssignment).where(
                    TeacherAssignment.teacher_id.in_(ids_for_assign)
                )
            ).scalars().all()
        )

    sub_ids = list({a.subject_id for a in all_assigns if a.subject_id})
    sub_map: dict = {}
    if sub_ids:
        try:
            for s in db.query(Subject).filter(Subject.id.in_(sub_ids)).all():
                sub_map[s.id] = s.name
        except NameError:
            from sqlalchemy import text as sa_text
            rows = db.execute(
                sa_text("SELECT id, name FROM subjects WHERE id = ANY(:ids)"),
                {"ids": sub_ids},
            ).fetchall()
            sub_map = {r[0]: r[1] for r in rows}

    by_teacher: dict = {}
    for a in all_assigns:
        by_teacher.setdefault(a.teacher_id, []).append(a)

    out: list[TeacherItemOut] = []
    for u in teachers:
        tids = [u.id]
        tp = getattr(u, "teacher_profile", None)
        if tp is not None:
            tids.append(tp.id)
        assigns = []
        for tid in tids:
            assigns.extend(by_teacher.get(tid, []))
        seen = set()
        uniq = []
        for a in assigns:
            if a.id in seen:
                continue
            seen.add(a.id)
            uniq.append(a)
        subjects = sorted({sub_map.get(a.subject_id, "") for a in uniq if a.subject_id} - {""})
        classes = sorted(
            {(a.class_name or "").strip() for a in uniq if (a.class_name or "").strip()}
        )
        out.append(
            TeacherItemOut(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                phone=u.phone or "",
                subjects=subjects,
                classes=classes,
            )
        )
    return out


@router.post("/teachers", response_model=TeacherItemOut, status_code=201)
def create_teacher(body: TeacherCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    existing = db.execute(select(User).where(User.email == body.email.lower())).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Barua pepe tayari inatumika.")
    code = f"TCH{datetime.utcnow().strftime('%y%m%d%H%M%S')}"
    user = User(email=body.email.lower().strip(), hashed_password=hash_password(body.password), full_name=body.full_name.strip(), role=UserRole.teacher, phone=body.phone.strip() if body.phone else None)
    db.add(user)
    db.flush()
    db.add(TeacherProfile(user_id=user.id, staff_code=code))
    db.commit()
    db.refresh(user)
    return TeacherItemOut(id=user.id, full_name=user.full_name, email=user.email, phone=user.phone or "", subjects=[], classes=[])


@router.get("/teachers/{teacher_id}/assignments", response_model=list[TeacherAssignmentOut])
def list_assignments(teacher_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    rows = db.execute(select(TeacherAssignment).where(TeacherAssignment.teacher_id == teacher_id)).scalars().all()
    out = []
    for a in rows:
        sub = db.get(Subject, a.subject_id)
        out.append(TeacherAssignmentOut(id=a.id, teacher_id=a.teacher_id, subject_id=a.subject_id, subject_name=sub.name if sub else "", class_id=a.class_name, class_name=a.class_name))
    return out


@router.post("/teacher-assignments", response_model=TeacherAssignmentOut, status_code=201)
def assign_teacher(body: TeacherAssignmentCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    teacher = db.get(User, body.teacher_id)
    if not teacher or teacher.role != UserRole.teacher:
        raise HTTPException(status_code=404, detail="Mwalimu hajapatikana.")
    sub = db.get(Subject, body.subject_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Somo halijapatikana.")
    row = TeacherAssignment(teacher_id=body.teacher_id, subject_id=body.subject_id, class_name=body.class_id.strip())
    db.add(row)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Mgawo huu tayari upo.")
    db.refresh(row)
    return TeacherAssignmentOut(id=row.id, teacher_id=row.teacher_id, subject_id=row.subject_id, subject_name=sub.name, class_id=row.class_name, class_name=row.class_name)


@router.delete("/teacher-assignments/{assignment_id}", status_code=204)
def remove_assignment(assignment_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = db.get(TeacherAssignment, assignment_id)
    if not row:
        raise HTTPException(status_code=404, detail="Mgawo haujapatikana.")
    db.delete(row)
    db.commit()
    return None


@router.get("/finance/summary", response_model=FinanceSummaryOut)
def finance_summary(month: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    total_salaries = float(db.scalar(select(func.coalesce(func.sum(SalaryRecord.amount), 0)).where(SalaryRecord.month == month)) or 0)
    total_expenses = float(db.scalar(select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.month == month)) or 0)
    total_collections = float(db.scalar(select(func.coalesce(func.sum(Collection.amount), 0)).where(Collection.month == month)) or 0)
    return FinanceSummaryOut(month=month, total_salaries=total_salaries, total_expenses=total_expenses, total_collections=total_collections, balance=total_collections - total_salaries - total_expenses)


@router.get("/finance/salaries", response_model=list[SalaryOut])
def list_salaries(month: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(select(SalaryRecord).where(SalaryRecord.month == month)).scalars().all()
    return [SalaryOut(id=r.id, teacher_id=r.teacher_id, teacher_name=(db.get(User, r.teacher_id).full_name if db.get(User, r.teacher_id) else ""), amount=float(r.amount), month=r.month, paid_at=r.paid_at, notes=r.notes or "") for r in rows]


@router.post("/finance/salaries", response_model=SalaryOut, status_code=201)
def create_salary(body: SalaryCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    t = db.get(User, body.teacher_id)
    if not t or t.role != UserRole.teacher:
        raise HTTPException(status_code=404, detail="Mwalimu hajapatikana.")
    row = SalaryRecord(teacher_id=body.teacher_id, amount=body.amount, month=body.month, paid_at=body.paid_at, notes=body.notes or None)
    db.add(row)
    db.commit()
    db.refresh(row)
    return SalaryOut(id=row.id, teacher_id=row.teacher_id, teacher_name=t.full_name, amount=float(row.amount), month=row.month, paid_at=row.paid_at, notes=row.notes or "")


@router.get("/finance/expenses", response_model=list[ExpenseOut])
def list_expenses(month: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(select(Expense).where(Expense.month == month)).scalars().all()
    return [ExpenseOut(id=r.id, amount=float(r.amount), category=r.category, month=r.month, description=r.description or "", recorded_at=r.recorded_at) for r in rows]


@router.post("/finance/expenses", response_model=ExpenseOut, status_code=201)
def create_expense(body: ExpenseCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = Expense(amount=body.amount, category=body.category.strip(), month=body.month, description=body.description or None, recorded_at=body.recorded_at)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ExpenseOut(id=row.id, amount=float(row.amount), category=row.category, month=row.month, description=row.description or "", recorded_at=row.recorded_at)


@router.get("/finance/collections", response_model=list[CollectionOut])
def list_collections(month: str = Query(...), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(select(Collection).where(Collection.month == month)).scalars().all()
    return [CollectionOut(id=r.id, amount=float(r.amount), source=r.source, month=r.month, recorded_at=r.recorded_at) for r in rows]


@router.post("/finance/collections", response_model=CollectionOut, status_code=201)
def create_collection(body: CollectionCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    row = Collection(amount=body.amount, source=body.source.strip(), month=body.month, recorded_at=body.recorded_at)
    db.add(row)
    db.commit()
    db.refresh(row)
    return CollectionOut(id=row.id, amount=float(row.amount), source=row.source, month=row.month, recorded_at=row.recorded_at)


# /classes moved to committee_classes.py


@router.get("/subjects", response_model=list[SubjectItemOut])
def list_subjects(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    rows = db.execute(select(Subject).order_by(Subject.name)).scalars().all()
    return [SubjectItemOut(id=s.id, name=s.name) for s in rows]


@router.get("/classes/{class_id}/students", response_model=list[StudentItemOut])
def list_students_by_class(class_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(select(StudentProfile).where(StudentProfile.class_name == class_id)).scalars().all()
    out = []
    for sp in rows:
        u = db.get(User, sp.user_id)
        out.append(StudentItemOut(id=sp.id, full_name=u.full_name if u else "", date_of_birth=sp.date_of_birth.isoformat() if sp.date_of_birth else "", parent_name=sp.guardian_name or "", parent_phone=sp.guardian_phone or "", class_name=sp.class_name))
    return out


@router.get("/exam-schedules", response_model=list[ExamScheduleOut])
def list_exam_schedules(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    rows = db.execute(select(ExamSchedule).order_by(ExamSchedule.exam_date)).scalars().all()
    out = []
    for r in rows:
        sub = db.get(Subject, r.subject_id)
        out.append(ExamScheduleOut(id=r.id, subject_id=r.subject_id, subject_name=sub.name if sub else "", class_id=r.class_name, class_name=r.class_name, exam_date=r.exam_date, start_time=r.start_time, end_time=r.end_time, room=r.room, status=r.status.value if hasattr(r.status, "value") else str(r.status)))
    return out


@router.post("/exam-schedules", response_model=ExamScheduleOut, status_code=201)
def create_exam_schedule(body: ExamScheduleCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    sub = db.get(Subject, body.subject_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Somo hali japatikana.")
    row = ExamSchedule(subject_id=body.subject_id, class_name=body.class_id.strip(), exam_date=body.exam_date, start_time=body.start_time, end_time=body.end_time, room=body.room.strip(), status=PublishStatus.draft)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ExamScheduleOut(id=row.id, subject_id=row.subject_id, subject_name=sub.name, class_id=row.class_name, class_name=row.class_name, exam_date=row.exam_date, start_time=row.start_time, end_time=row.end_time, room=row.room, status=row.status.value)


@router.post("/exam-schedules/{schedule_id}/publish", response_model=ExamScheduleOut)
def publish_exam_schedule(schedule_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    row = db.get(ExamSchedule, schedule_id)
    if not row:
        raise HTTPException(status_code=404, detail="Ratiba haijapatikana.")
    row.status = PublishStatus.published
    db.commit()
    db.refresh(row)
    sub = db.get(Subject, row.subject_id)
    return ExamScheduleOut(id=row.id, subject_id=row.subject_id, subject_name=sub.name if sub else "", class_id=row.class_name, class_name=row.class_name, exam_date=row.exam_date, start_time=row.start_time, end_time=row.end_time, room=row.room, status=row.status.value)


@router.get("/timetable", response_model=list[TimetableOut])
def list_timetable(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    rows = db.execute(select(CommitteeTimetableEntry).order_by(CommitteeTimetableEntry.day_of_week, CommitteeTimetableEntry.start_time)).scalars().all()
    out = []
    for r in rows:
        sub = db.get(Subject, r.subject_id)
        t = db.get(User, r.teacher_id)
        out.append(TimetableOut(id=r.id, subject_id=r.subject_id, subject_name=sub.name if sub else "", teacher_id=r.teacher_id, teacher_name=t.full_name if t else "", class_id=r.class_name, class_name=r.class_name, day_of_week=r.day_of_week, day_name=DAY_NAMES[r.day_of_week] if 0 <= r.day_of_week < len(DAY_NAMES) else str(r.day_of_week), start_time=r.start_time, end_time=r.end_time, status=r.status.value if hasattr(r.status, "value") else str(r.status)))
    return out


@router.post("/timetable", response_model=TimetableOut, status_code=201)
def create_timetable_entry(body: TimetableCreate, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    Subject = _Subject()
    sub = db.get(Subject, body.subject_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Somo halijapatikana.")
    t = db.get(User, body.teacher_id)
    if not t or t.role != UserRole.teacher:
        raise HTTPException(status_code=404, detail="Mwalimu hajapatikana.")
    row = CommitteeTimetableEntry(subject_id=body.subject_id, teacher_id=body.teacher_id, class_name=body.class_id.strip(), day_of_week=body.day_of_week, start_time=body.start_time, end_time=body.end_time, status=PublishStatus.draft)
    db.add(row)
    db.commit()
    db.refresh(row)
    return TimetableOut(id=row.id, subject_id=row.subject_id, subject_name=sub.name, teacher_id=row.teacher_id, teacher_name=t.full_name, class_id=row.class_name, class_name=row.class_name, day_of_week=row.day_of_week, day_name=DAY_NAMES[row.day_of_week] if 0 <= row.day_of_week < len(DAY_NAMES) else str(row.day_of_week), start_time=row.start_time, end_time=row.end_time, status=row.status.value)


@router.post("/timetable/publish")
def publish_timetable(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(select(CommitteeTimetableEntry).where(CommitteeTimetableEntry.status == PublishStatus.draft)).scalars().all()
    for r in rows:
        r.status = PublishStatus.published
    db.commit()
    return {"updated": len(rows)}

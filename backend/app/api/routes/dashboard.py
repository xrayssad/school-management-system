from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.attendance import Attendance, AttendanceStatus
from app.models.communication import Announcement, Event
from app.models.exam import Exam, Grade
from app.models.user import User, StudentProfile, TeacherProfile

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/student")
def student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students have a student dashboard")
    sp = current_user.student_profile

    grades = db.query(Grade).filter(Grade.student_id == sp.id).all()
    attendance = db.query(Attendance).filter(Attendance.student_id == sp.id).all()
    assignments = db.query(Assignment).filter(Assignment.class_name == sp.class_name).all()
    submissions = {s.assignment_id: s for s in db.query(Submission).filter(Submission.student_id == sp.id).all()}
    upcoming_events = db.query(Event).order_by(Event.event_date.asc()).limit(5).all()
    announcements = (
        db.query(Announcement)
        .filter((Announcement.class_name == sp.class_name) | (Announcement.class_name.is_(None)))
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )

    avg_pct = 0.0
    if grades:
        pct_values = []
        for g in grades:
            exam = db.get(Exam, g.exam_id)
            if exam and exam.total_marks:
                pct_values.append((g.marks_obtained / exam.total_marks) * 100)
        avg_pct = round(sum(pct_values) / len(pct_values), 1) if pct_values else 0.0

    total_att = len(attendance)
    present = sum(1 for a in attendance if a.status in (AttendanceStatus.present, AttendanceStatus.late))
    attendance_pct = round((present / total_att) * 100, 1) if total_att else 100.0

    pending_assignments = [a for a in assignments if a.id not in submissions or submissions[a.id].status == SubmissionStatus.pending]

    return {
        "student": {"name": current_user.full_name, "class_name": sp.class_name, "student_code": sp.student_code},
        "average_percentage": avg_pct,
        "attendance_percentage": attendance_pct,
        "total_subjects_graded": len({db.get(Exam, g.exam_id).subject_id for g in grades if db.get(Exam, g.exam_id)}),
        "pending_assignments": len(pending_assignments),
        "upcoming_events": [{"id": e.id, "title": e.title, "event_date": e.event_date} for e in upcoming_events],
        "recent_announcements": [
            {"id": a.id, "title": a.title, "message": a.message, "created_at": a.created_at} for a in announcements
        ],
    }


@router.get("/teacher")
def teacher_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_teacher)):
    if not current_user.teacher_profile:
        # admin viewing - return school-wide summary
        total_students = db.query(StudentProfile).count()
        total_teachers = db.query(TeacherProfile).count()
        return {
            "role": "admin",
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_classes": len({r[0] for r in db.query(StudentProfile.class_name).distinct().all()}),
        }

    tp = current_user.teacher_profile
    my_assignments = db.query(Assignment).filter(Assignment.teacher_id == tp.id).all()
    my_exams = db.query(Exam).filter(Exam.teacher_id == tp.id).all()
    classes = {a.class_name for a in my_assignments} | {e.class_name for e in my_exams}
    student_count = db.query(StudentProfile).filter(StudentProfile.class_name.in_(classes)).count() if classes else 0

    pending_grading = 0
    for a in my_assignments:
        pending_grading += (
            db.query(Submission)
            .filter(Submission.assignment_id == a.id, Submission.status == SubmissionStatus.submitted)
            .count()
        )

    return {
        "role": "teacher",
        "teacher_name": current_user.full_name,
        "classes": sorted(classes),
        "student_count": student_count,
        "assignment_count": len(my_assignments),
        "exam_count": len(my_exams),
        "pending_grading": pending_grading,
    }


@router.get("/teacher/analytics")
def teacher_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_teacher)):
    """Grade distribution + attendance trend for the teacher's classes, used by charts on the frontend."""
    tp = current_user.teacher_profile
    exam_q = db.query(Exam)
    if tp:
        exam_q = exam_q.filter(Exam.teacher_id == tp.id)
    exams = exam_q.all()
    exam_ids = [e.id for e in exams]

    grade_buckets = defaultdict(int)
    for g in db.query(Grade).filter(Grade.exam_id.in_(exam_ids)).all():
        grade_buckets[g.grade_letter] += 1

    classes = {e.class_name for e in exams}
    attendance_by_class = {}
    for c in classes:
        records = db.query(Attendance).filter(Attendance.class_name == c).all()
        total = len(records)
        present = sum(1 for r in records if r.status in (AttendanceStatus.present, AttendanceStatus.late))
        attendance_by_class[c] = round((present / total) * 100, 1) if total else 100.0

    subject_avg = defaultdict(list)
    for e in exams:
        grades = db.query(Grade).filter(Grade.exam_id == e.id).all()
        if grades and e.subject:
            avg = sum(g.marks_obtained for g in grades) / len(grades)
            subject_avg[e.subject.name].append(round((avg / e.total_marks) * 100, 1))

    subject_averages = {k: round(sum(v) / len(v), 1) for k, v in subject_avg.items()}

    return {
        "grade_distribution": dict(grade_buckets),
        "attendance_by_class": attendance_by_class,
        "subject_averages": subject_averages,
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.exam import Exam, Grade, compute_grade_letter
from app.models.user import User, StudentProfile, TeacherProfile
from app.schemas.exam import ExamOut, ExamCreate, GradeOut, GradeCreate

router = APIRouter(prefix="/exams", tags=["exams"])
grades_router = APIRouter(prefix="/grades", tags=["grades"])


@router.get("", response_model=list[ExamOut])
def list_exams(class_name: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Exam)
    if class_name:
        q = q.filter(Exam.class_name == class_name)
    elif current_user.student_profile:
        q = q.filter(Exam.class_name == current_user.student_profile.class_name)
    return q.order_by(Exam.exam_date.desc()).all()


@router.post("", response_model=ExamOut, dependencies=[Depends(require_teacher)])
def create_exam(payload: ExamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teacher_id = current_user.teacher_profile.id if current_user.teacher_profile else None
    exam = Exam(**payload.model_dump(), teacher_id=teacher_id)
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


@grades_router.get("/exam/{exam_id}", response_model=list[GradeOut], dependencies=[Depends(require_teacher)])
def grades_for_exam(exam_id: str, db: Session = Depends(get_db)):
    return db.query(Grade).filter(Grade.exam_id == exam_id).all()


@grades_router.get("/me", response_model=list[GradeOut])
def my_grades(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students have grades")
    return (
        db.query(Grade)
        .filter(Grade.student_id == current_user.student_profile.id)
        .order_by(Grade.graded_at.desc())
        .all()
    )


@grades_router.get("/student/{student_id}", response_model=list[GradeOut], dependencies=[Depends(require_teacher)])
def grades_for_student(student_id: str, db: Session = Depends(get_db)):
    return db.query(Grade).filter(Grade.student_id == student_id).order_by(Grade.graded_at.desc()).all()


@grades_router.post("", response_model=GradeOut, dependencies=[Depends(require_teacher)])
def record_grade(payload: GradeCreate, db: Session = Depends(get_db)):
    exam = db.get(Exam, payload.exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    grade = (
        db.query(Grade)
        .filter(Grade.exam_id == payload.exam_id, Grade.student_id == payload.student_id)
        .first()
    )
    letter = compute_grade_letter(payload.marks_obtained, exam.total_marks)
    if grade:
        grade.marks_obtained = payload.marks_obtained
        grade.grade_letter = letter
        grade.remarks = payload.remarks
    else:
        grade = Grade(
            exam_id=payload.exam_id,
            student_id=payload.student_id,
            marks_obtained=payload.marks_obtained,
            grade_letter=letter,
            remarks=payload.remarks,
        )
        db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade

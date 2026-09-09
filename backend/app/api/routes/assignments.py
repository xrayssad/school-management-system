from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.user import User
from app.schemas.assignment import AssignmentOut, AssignmentCreate, SubmissionOut, SubmissionCreate, SubmissionGrade

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("", response_model=list[AssignmentOut])
def list_assignments(class_name: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Assignment)
    if class_name:
        q = q.filter(Assignment.class_name == class_name)
    elif current_user.student_profile:
        q = q.filter(Assignment.class_name == current_user.student_profile.class_name)
    assignments = q.order_by(Assignment.due_date.desc()).all()
    out = []
    for a in assignments:
        data = AssignmentOut.model_validate(a).model_dump()
        data["submission_count"] = len(a.submissions)
        out.append(data)
    return out


@router.post("", response_model=AssignmentOut, dependencies=[Depends(require_teacher)])
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teacher_id = current_user.teacher_profile.id if current_user.teacher_profile else None
    a = Assignment(**payload.model_dump(), teacher_id=teacher_id)
    db.add(a)
    db.commit()
    db.refresh(a)
    data = AssignmentOut.model_validate(a).model_dump()
    data["submission_count"] = 0
    return data


@router.post("/{assignment_id}/submit", response_model=SubmissionOut)
def submit_assignment(assignment_id: str, payload: SubmissionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students can submit assignments")
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    sub = (
        db.query(Submission)
        .filter(Submission.assignment_id == assignment_id, Submission.student_id == current_user.student_profile.id)
        .first()
    )
    status_val = SubmissionStatus.late if datetime.utcnow().date() > assignment.due_date else SubmissionStatus.submitted
    if sub:
        sub.content = payload.content
        sub.status = status_val
        sub.submitted_at = datetime.utcnow()
    else:
        sub = Submission(
            assignment_id=assignment_id,
            student_id=current_user.student_profile.id,
            content=payload.content,
            status=status_val,
            submitted_at=datetime.utcnow(),
        )
        db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/{assignment_id}/submissions", response_model=list[SubmissionOut], dependencies=[Depends(require_teacher)])
def list_submissions(assignment_id: str, db: Session = Depends(get_db)):
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()


@router.put("/submissions/{submission_id}/grade", response_model=SubmissionOut, dependencies=[Depends(require_teacher)])
def grade_submission(submission_id: str, payload: SubmissionGrade, db: Session = Depends(get_db)):
    sub = db.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.marks_obtained = payload.marks_obtained
    sub.feedback = payload.feedback
    sub.status = SubmissionStatus.graded
    db.commit()
    db.refresh(sub)
    return sub

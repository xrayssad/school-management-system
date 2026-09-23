from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401  -- ensures all models are registered on Base.metadata

from app.api.routes import committee_announcements_files
from app.api.routes import exam_reports
from app.api.routes import auth_password, committee_password
from app.api.routes import auth, users, students, teachers, subjects, timetable, exams, attendance, assignments, announcements, events, messages, dashboard, committee, committee_registrations, fees

app = FastAPI(title=settings.PROJECT_NAME)

uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)



@app.on_event("startup")
def on_startup():
    # Creates tables if they don't already exist. For production schema changes, use Alembic migrations instead.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}


api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(auth_password.router, prefix=api_prefix)
app.include_router(committee_password.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(students.router, prefix=api_prefix)
app.include_router(teachers.router, prefix=api_prefix)
app.include_router(subjects.router, prefix=api_prefix)
app.include_router(timetable.router, prefix=api_prefix)
app.include_router(exams.router, prefix=api_prefix)
app.include_router(exams.grades_router, prefix=api_prefix)
app.include_router(attendance.router, prefix=api_prefix)
app.include_router(assignments.router, prefix=api_prefix)
app.include_router(announcements.router, prefix=api_prefix)
app.include_router(events.router, prefix=api_prefix)
app.include_router(messages.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(committee.router, prefix=api_prefix)
app.include_router(committee_registrations.router, prefix=api_prefix)
app.include_router(fees.router, prefix=api_prefix)
app.include_router(exam_reports.router, prefix=api_prefix)

app.include_router(committee_announcements_files.router, prefix=api_prefix)

from app.api.routes import teacher_grades
app.include_router(teacher_grades.router, prefix=api_prefix)

from app.api.routes import committee_grades
app.include_router(committee_grades.router, prefix=api_prefix)

from app.api.routes import student_grades
app.include_router(student_grades.router, prefix=api_prefix)






from app.api.routes.teacher_scope import router as teacher_scope_router
app.include_router(teacher_scope_router, prefix=api_prefix)

from app.api.routes.student_timetable import router as student_timetable_router
app.include_router(student_timetable_router, prefix=api_prefix)

from app.api.routes.committee_promotion import router as committee_promotion_router
app.include_router(committee_promotion_router, prefix=api_prefix)


from app.api.routes.committee_csv_students import router as committee_csv_students_router
app.include_router(committee_csv_students_router, prefix=api_prefix)

from app.api.routes.teacher_grades_csv import router as teacher_grades_csv_router
app.include_router(teacher_grades_csv_router, prefix=api_prefix)

from app.api.routes.committee_users import router as committee_users_router
app.include_router(committee_users_router, prefix=api_prefix)

from app.api.routes.committee_classes import router as committee_classes_router
app.include_router(committee_classes_router, prefix=api_prefix)

from app.api.routes.library import router as library_router
app.include_router(library_router, prefix=api_prefix)

from app.api.routes.exam_schedule_views import router as exam_schedule_views_router
app.include_router(exam_schedule_views_router, prefix=api_prefix)

from app.api.routes.my_subjects import router as my_subjects_router
app.include_router(my_subjects_router, prefix=api_prefix)

from app.api.routes.student_teachers import router as student_teachers_router
app.include_router(student_teachers_router, prefix=api_prefix)

from app.api.routes.student_fees_view import router as student_fees_view_router
app.include_router(student_fees_view_router, prefix=api_prefix)

from app.api.routes.committee_fees import router as committee_fees_router
app.include_router(committee_fees_router, prefix=api_prefix)

from app.api.routes.committee_students_manual import router as committee_students_manual_router
app.include_router(committee_students_manual_router, prefix=api_prefix)

from app.api.routes.teacher_manual_grade import router as teacher_manual_grade_router
app.include_router(teacher_manual_grade_router, prefix=api_prefix)

from app.api.routes.committee_grades_board import router as committee_grades_board_router
app.include_router(committee_grades_board_router, prefix=api_prefix)

from app.api.routes.teacher_exams_scope import router as teacher_exams_scope_router
app.include_router(teacher_exams_scope_router, prefix=api_prefix)

from app.api.routes.timetable_views import router as timetable_views_router
app.include_router(timetable_views_router, prefix=api_prefix)

from app.api.routes.student_teachers_fix import router as student_teachers_fix_router
app.include_router(student_teachers_fix_router, prefix=api_prefix)

from app.api.routes.student_results import router as student_results_router
app.include_router(student_results_router, prefix=api_prefix)

from app.api.routes.committee_subjects import router as committee_subjects_router
app.include_router(committee_subjects_router, prefix=api_prefix)

from app.api.routes.subjects_catalog import router as subjects_catalog_router
app.include_router(subjects_catalog_router, prefix=api_prefix)

from app.api.routes.student_profile import router as student_profile_router
app.include_router(student_profile_router, prefix=api_prefix)

from app.api.routes.committee_exam_reports_pdf import router as committee_exam_reports_pdf_router
app.include_router(committee_exam_reports_pdf_router, prefix=api_prefix)

from app.api.routes.exam_reports_public import router as exam_reports_public_router
app.include_router(exam_reports_public_router, prefix=api_prefix)

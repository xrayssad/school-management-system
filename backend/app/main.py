from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401  -- ensures all models are registered on Base.metadata

from app.api.routes import auth, users, students, teachers, subjects, timetable, exams, attendance, assignments, announcements, events, messages, dashboard

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Creates tables if they don't already exist. For production schema changes, use Alembic migrations instead.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}


api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
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

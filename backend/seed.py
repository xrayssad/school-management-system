"""
Seed the database with demo data: an admin, teachers, students, subjects,
a weekly timetable, exams/grades, assignments, attendance, announcements and events.

Run with:  python seed.py
(Make sure DATABASE_URL in your .env points at your Supabase Postgres instance first.)
"""
import random
from datetime import date, timedelta, datetime

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import hash_password
from app import models
from app.models.user import User, StudentProfile, TeacherProfile, UserRole
from app.models.academic import Subject, TimetableEntry
from app.models.exam import Exam, Grade, compute_grade_letter
from app.models.attendance import Attendance, AttendanceStatus
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.communication import Announcement, Event

SUBJECTS = [
    {"name": "Quran", "code": "QUR", "color": "#2E7D32", "icon": "📖"},
    {"name": "Tajweed", "code": "TAJ", "color": "#1976D2", "icon": "🎵"},
    {"name": "Hadith", "code": "HAD", "color": "#D32F2F", "icon": "📚"},
    {"name": "Tahfeedh", "code": "TAH", "color": "#ED6C02", "icon": "💫"},
    {"name": "Sira", "code": "SIR", "color": "#9C27B0", "icon": "🕌"},
    {"name": "Fiqh", "code": "FIQ", "color": "#0097A7", "icon": "⚖️"},
    {"name": "Aqeedah", "code": "AQD", "color": "#757575", "icon": "🌟"},
    {"name": "Arabic", "code": "ARB", "color": "#388E3C", "icon": "🔤"},
    {"name": "Tafsir", "code": "TFS", "color": "#7B1FA2", "icon": "📖"},
]

TEACHERS = [
    {"name": "Sheikh Ahmed Ali", "email": "ahmed.ali@madrasa.sc.tz", "subjects": ["Quran", "Tajweed"], "experience": 15, "specialization": "Quran & Tajweed"},
    {"name": "Ustadh Mohammed Hassan", "email": "mohammed.hassan@madrasa.sc.tz", "subjects": ["Hadith", "Fiqh"], "experience": 12, "specialization": "Islamic Law"},
    {"name": "Ustadha Fatima Noor", "email": "fatima.noor@madrasa.sc.tz", "subjects": ["Tahfeedh", "Quran"], "experience": 10, "specialization": "Quran Memorization"},
    {"name": "Sheikh Ibrahim Omar", "email": "ibrahim.omar@madrasa.sc.tz", "subjects": ["Sira", "Aqeedah"], "experience": 18, "specialization": "Islamic History"},
    {"name": "Ustadh Yusuf Abdullah", "email": "yusuf.abdullah@madrasa.sc.tz", "subjects": ["Arabic", "Tafsir"], "experience": 8, "specialization": "Arabic Language"},
]

CLASSES = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"]

STUDENTS = [
    {"name": "Ahmed Mohammed", "class_name": "Darasa la 5"},
    {"name": "Fatima Juma", "class_name": "Darasa la 5"},
    {"name": "Omar Hassan", "class_name": "Darasa la 4"},
    {"name": "Aisha Salim", "class_name": "Darasa la 5"},
    {"name": "Yusuf Abdullah Jr", "class_name": "Darasa la 4"},
    {"name": "Hamisi Rajab", "class_name": "Darasa la 6"},
    {"name": "Zainab Omar", "class_name": "Darasa la 6"},
    {"name": "Khalid Ibrahim", "class_name": "Darasa la 5"},
    {"name": "Maryam Ahmed", "class_name": "Darasa la 3"},
    {"name": "Hassan Ali", "class_name": "Darasa la 3"},
    {"name": "Said Mohammed", "class_name": "Darasa la 4"},
]

WEEKLY_TIMETABLE = {
    "Monday": [
        ("Quran", "Sheikh Ahmed Ali", "08:00", "09:00", "Masjid Kubwa", "lesson"),
        ("Tajweed", "Sheikh Ahmed Ali", "09:15", "10:15", "Chumba 1", "lesson"),
        ("Hadith", "Ustadh Mohammed Hassan", "10:30", "11:30", "Chumba 2", "lesson"),
        (None, None, "11:45", "12:00", "", "break"),
        ("Tahfeedh", "Ustadha Fatima Noor", "12:00", "13:00", "Hifdh Room", "lesson"),
    ],
    "Tuesday": [
        ("Sira", "Sheikh Ibrahim Omar", "08:00", "09:00", "Chumba 3", "lesson"),
        ("Fiqh", "Ustadh Mohammed Hassan", "09:15", "10:15", "Chumba 2", "lesson"),
        ("Arabic", "Ustadh Yusuf Abdullah", "10:30", "11:30", "Chumba 1", "lesson"),
        (None, None, "11:45", "12:00", "", "break"),
        ("Quran", "Sheikh Ahmed Ali", "12:00", "13:00", "Masjid Kubwa", "lesson"),
    ],
    "Wednesday": [
        ("Tafsir", "Ustadh Yusuf Abdullah", "08:00", "09:00", "Chumba 3", "lesson"),
        ("Aqeedah", "Sheikh Ibrahim Omar", "09:15", "10:15", "Chumba 2", "lesson"),
        ("Tahfeedh", "Ustadha Fatima Noor", "10:30", "11:30", "Hifdh Room", "lesson"),
        (None, None, "11:45", "12:00", "", "break"),
        ("Tajweed", "Sheikh Ahmed Ali", "12:00", "13:00", "Chumba 1", "lesson"),
    ],
    "Thursday": [
        ("Hadith", "Ustadh Mohammed Hassan", "08:00", "09:00", "Chumba 2", "lesson"),
        ("Fiqh", "Ustadh Mohammed Hassan", "09:15", "10:15", "Chumba 2", "lesson"),
        ("Sira", "Sheikh Ibrahim Omar", "10:30", "11:30", "Chumba 3", "lesson"),
        (None, None, "11:45", "12:00", "", "break"),
        ("Quran", "Sheikh Ahmed Ali", "12:00", "13:00", "Masjid Kubwa", "lesson"),
    ],
    "Friday": [
        (None, "All Teachers", "12:00", "13:30", "Masjid Kubwa", "prayer"),
        (None, "Guest Speaker", "14:00", "15:30", "Hall Kuu", "workshop"),
    ],
}


def run():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).count() > 0:
            print("Database already has data. Aborting seed to avoid duplicates.")
            return

        print("Seeding subjects...")
        subject_map = {}
        for s in SUBJECTS:
            subj = Subject(**s)
            db.add(subj)
            db.flush()
            subject_map[s["name"]] = subj

        print("Seeding admin...")
        admin = User(
            email="admin@madrasa.sc.tz",
            hashed_password=hash_password("Admin@123"),
            full_name="Madrasa Administrator",
            role=UserRole.admin,
            phone="+255 777 000 000",
        )
        db.add(admin)

        print("Seeding teachers...")
        teacher_profiles = {}
        for i, t in enumerate(TEACHERS):
            user = User(
                email=t["email"],
                hashed_password=hash_password("Teacher@123"),
                full_name=t["name"],
                role=UserRole.teacher,
                phone=f"+255 78{i} 000 00{i}",
            )
            db.add(user)
            db.flush()
            profile = TeacherProfile(
                user_id=user.id,
                staff_code=f"T{1000+i}",
                specialization=t["specialization"],
                experience_years=t["experience"],
                bio=f"{t['name']} has {t['experience']} years of experience teaching {', '.join(t['subjects'])}.",
            )
            db.add(profile)
            db.flush()
            teacher_profiles[t["name"]] = profile

        print("Seeding students...")
        student_profiles = []
        for i, s in enumerate(STUDENTS):
            email = s["name"].lower().replace(" ", ".").replace("'", "") + "@student.madrasa.sc.tz"
            user = User(
                email=email,
                hashed_password=hash_password("Student@123"),
                full_name=s["name"],
                role=UserRole.student,
                phone=f"+255 789 012 {300+i}",
            )
            db.add(user)
            db.flush()
            profile = StudentProfile(
                user_id=user.id,
                student_code=f"S{1000+i}",
                class_name=s["class_name"],
                date_of_birth=date(2012, 1, 1) + timedelta(days=i * 30),
                guardian_name=f"Guardian of {s['name']}",
                guardian_phone=f"+255 789 099 {300+i}",
                enrollment_date=date(2024, 1, 8),
            )
            db.add(profile)
            db.flush()
            student_profiles.append(profile)

        print("Seeding timetable...")
        for day, entries in WEEKLY_TIMETABLE.items():
            for class_name in CLASSES:
                for subject_name, teacher_name, start, end, room, entry_type in entries:
                    db.add(TimetableEntry(
                        day_of_week=day,
                        class_name=class_name,
                        subject_id=subject_map[subject_name].id if subject_name else None,
                        teacher_id=teacher_profiles[teacher_name].id if teacher_name in teacher_profiles else None,
                        start_time=start,
                        end_time=end,
                        room=room,
                        entry_type=entry_type,
                    ))

        print("Seeding exams and grades...")
        subject_teacher = {}
        for t in TEACHERS:
            for subj in t["subjects"]:
                subject_teacher[subj] = t["name"]

        exam_subjects = ["Quran", "Tajweed", "Hadith", "Tahfeedh", "Sira"]
        for subj_name in exam_subjects:
            for class_name in CLASSES:
                exam = Exam(
                    title=f"{subj_name} Mid-Term Exam",
                    subject_id=subject_map[subj_name].id,
                    teacher_id=teacher_profiles[subject_teacher[subj_name]].id,
                    class_name=class_name,
                    exam_date=date(2024, 2, 15),
                    total_marks=100,
                )
                db.add(exam)
                db.flush()
                for sp in student_profiles:
                    if sp.class_name == class_name:
                        marks = random.randint(60, 98)
                        db.add(Grade(
                            exam_id=exam.id,
                            student_id=sp.id,
                            marks_obtained=marks,
                            grade_letter=compute_grade_letter(marks, 100),
                            remarks="Good progress" if marks >= 75 else "Needs more practice",
                        ))

        print("Seeding attendance (last 20 school days)...")
        today = date.today()
        day_count = 0
        offset = 0
        while day_count < 20:
            offset += 1
            d = today - timedelta(days=offset)
            if d.weekday() == 5:  # skip Saturday only, Friday is a school day here
                continue
            day_count += 1
            for sp in student_profiles:
                roll = random.random()
                status = AttendanceStatus.present if roll > 0.12 else (AttendanceStatus.late if roll > 0.06 else AttendanceStatus.absent)
                db.add(Attendance(student_id=sp.id, class_name=sp.class_name, date=d, status=status))

        print("Seeding assignments...")
        for subj_name, teacher_name in [("Quran", "Sheikh Ahmed Ali"), ("Tajweed", "Sheikh Ahmed Ali"), ("Hadith", "Ustadh Mohammed Hassan"), ("Fiqh", "Ustadh Mohammed Hassan")]:
            for class_name in CLASSES:
                a = Assignment(
                    title=f"{subj_name} Revision Homework",
                    description=f"Complete the {subj_name} exercises assigned in class and be ready to recite next lesson.",
                    subject_id=subject_map[subj_name].id,
                    teacher_id=teacher_profiles[teacher_name].id,
                    class_name=class_name,
                    due_date=today + timedelta(days=random.randint(2, 10)),
                    total_marks=50,
                )
                db.add(a)
                db.flush()
                for sp in student_profiles:
                    if sp.class_name == class_name and random.random() > 0.4:
                        db.add(Submission(
                            assignment_id=a.id,
                            student_id=sp.id,
                            content="Completed all exercises as instructed.",
                            status=SubmissionStatus.submitted,
                            submitted_at=datetime.utcnow(),
                        ))

        print("Seeding announcements...")
        db.add(Announcement(
            title="Maandalizi ya Mtihani wa Quran",
            message="Tafadhali jaribuni kusoma Surah Al-Baqarah aya 1-100 kwa maandalizi ya mtihani ujao.",
            teacher_id=teacher_profiles["Sheikh Ahmed Ali"].id,
            subject_id=subject_map["Quran"].id,
            class_name="Darasa la 5",
            priority="important",
        ))
        db.add(Announcement(
            title="Mabadiliko ya Ratiba",
            message="Somo la Fiqh litahamishwa kutoka Jumanne hadi Alhamisi kuanzia wiki ijayo.",
            teacher_id=teacher_profiles["Ustadh Mohammed Hassan"].id,
            subject_id=subject_map["Fiqh"].id,
            class_name=None,
            priority="normal",
        ))
        db.add(Announcement(
            title="Karibu Muhula Mpya",
            message="Tunawakaribisha wanafunzi wote kwa muhula mpya wa masomo. Tuwe na mwaka mwema wa kujifunza.",
            teacher_id=None,
            class_name=None,
            priority="normal",
        ))

        print("Seeding events...")
        db.add(Event(title="Mtihani wa Muhula", description="Mtihani wa mwisho wa muhula kwa wanafunzi wote.", event_date=today + timedelta(days=14), location="Chumba cha Mitihani", category="exam"))
        db.add(Event(title="Maulid Celebration", description="Sherehe ya Maulid ya Mtume (S.A.W) shuleni.", event_date=today + timedelta(days=21), location="Masjid Kubwa", category="celebration"))
        db.add(Event(title="Parents Meeting", description="Kikao cha wazazi na walimu kujadili maendeleo ya wanafunzi.", event_date=today + timedelta(days=7), location="Hall Kuu", category="meeting"))

        db.commit()
        print("\nSeed complete!")
        print("=" * 60)
        print("Demo login credentials:")
        print("  Admin:   admin@madrasa.sc.tz / Admin@123")
        print("  Teacher: ahmed.ali@madrasa.sc.tz / Teacher@123")
        print("  Student: ahmed.mohammed@student.madrasa.sc.tz / Student@123")
        print("=" * 60)

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()

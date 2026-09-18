from __future__ import annotations

import csv
import io
import uuid
import zipfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/students", tags=["committee-csv-students"])
require_committee = require_role(UserRole.committee, UserRole.admin)

UPLOAD = Path("uploads/students")
UPLOAD.mkdir(parents=True, exist_ok=True)


def _gen_code(db: Session) -> str:
    for _ in range(40):
        code = f"STU{uuid.uuid4().hex[:5].upper()}"
        if not db.execute(
            text("SELECT 1 FROM student_profiles WHERE student_code = :c"), {"c": code}
        ).first():
            return code
    return f"STU{uuid.uuid4().hex[:8].upper()}"


@router.post("/import-csv")
async def import_csv(
    file: UploadFile = File(...),
    photos_zip: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    raw = await file.read()
    try:
        text_data = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text_data = raw.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text_data))
    if not reader.fieldnames:
        raise HTTPException(400, detail="CSV tupu au headers hazipo")

    fields = {((f or "").strip().lower()): f for f in reader.fieldnames}

    def col(*names: str):
        for n in names:
            if n in fields:
                return fields[n]
        return None

    k_name = col("full_name", "jina", "name")
    k_email = col("email", "barua")
    k_class = col("class_name", "darasa", "class")
    k_phone = col("phone", "simu")
    k_pass = col("password", "nenosiri")
    k_code = col("student_code", "namba", "code")
    k_photo = col("photo_filename", "photo", "picha", "image")

    if not k_name or not k_email or not k_class:
        raise HTTPException(
            400,
            detail="CSV iwe na full_name, email, class_name (headers)",
        )

    photos: dict[str, bytes] = {}
    if photos_zip is not None and photos_zip.filename:
        zdata = await photos_zip.read()
        try:
            with zipfile.ZipFile(io.BytesIO(zdata)) as zf:
                for name in zf.namelist():
                    if name.endswith("/") or name.startswith("__"):
                        continue
                    base = Path(name).name
                    if base.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                        blob = zf.read(name)
                        photos[base] = blob
                        photos[base.lower()] = blob
        except zipfile.BadZipFile:
            raise HTTPException(400, detail="photos_zip si faili zip sahihi")

    created, skipped, errors = 0, 0, []

    for i, row in enumerate(reader, start=2):
        full_name = (row.get(k_name) or "").strip()
        email = (row.get(k_email) or "").strip().lower()
        class_name = (row.get(k_class) or "").strip()
        if not full_name or not email or not class_name:
            errors.append(f"mstari {i}: jina, email na darasa vinahitajika")
            continue

        if db.execute(text("SELECT id FROM users WHERE email = :e"), {"e": email}).first():
            skipped += 1
            errors.append(f"{email}: tayari ipo")
            continue

        password = ((row.get(k_pass) or "").strip() if k_pass else "") or "Student@123"
        phone = (row.get(k_phone) or "").strip() if k_phone else None
        code = (row.get(k_code) or "").strip() if k_code else ""
        if not code:
            code = _gen_code(db)
        elif db.execute(
            text("SELECT 1 FROM student_profiles WHERE student_code = :c"), {"c": code}
        ).first():
            code = _gen_code(db)

        photo_url = None
        if k_photo:
            pfn = (row.get(k_photo) or "").strip()
            if pfn:
                blob = (
                    photos.get(pfn)
                    or photos.get(pfn.lower())
                    or photos.get(Path(pfn).name)
                )
                if blob:
                    ext = Path(pfn).suffix.lower() or ".jpg"
                    fname = f"{uuid.uuid4().hex}{ext}"
                    (UPLOAD / fname).write_bytes(blob)
                    photo_url = f"/uploads/students/{fname}"
                else:
                    errors.append(f"{email}: picha '{pfn}' haipo kwenye zip")

        uid = str(uuid.uuid4())
        pid = str(uuid.uuid4())
        try:
            db.execute(
                text(
                    """
                    INSERT INTO users
                      (id, email, hashed_password, full_name, role, phone, avatar_url, is_active, created_at)
                    VALUES
                      (:id, :email, :hp, :fn, 'student', :phone, :av, true, NOW())
                    """
                ),
                {
                    "id": uid,
                    "email": email,
                    "hp": hash_password(password),
                    "fn": full_name,
                    "phone": phone or None,
                    "av": photo_url,
                },
            )
            db.execute(
                text(
                    """
                    INSERT INTO student_profiles (id, user_id, student_code, class_name, enrollment_date)
                    VALUES (:id, :uid, :code, :cn, CURRENT_DATE)
                    """
                ),
                {"id": pid, "uid": uid, "code": code, "cn": class_name},
            )
            db.commit()
            created += 1
        except Exception as e:
            db.rollback()
            errors.append(f"{email}: {e}")

    return {
        "ok": True,
        "created": created,
        "skipped": skipped,
        "errors": errors[:50],
        "default_password": "Student@123",
    }


@router.get("")
def list_students(
    class_name: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    """Orodha ya wanafunzi waliosajiliwa."""
    sql = """
        SELECT u.id AS user_id, u.full_name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at,
               sp.id AS profile_id, sp.student_code, sp.class_name,
               sp.promotion_status, sp.guardian_name, sp.guardian_phone
        FROM users u
        JOIN student_profiles sp ON sp.user_id = u.id
        WHERE u.role = 'student'
    """
    params = {}
    if class_name:
        sql += " AND sp.class_name = :cn"
        params["cn"] = class_name
    if q:
        sql += " AND (u.full_name ILIKE :q OR u.email ILIKE :q OR sp.student_code ILIKE :q)"
        params["q"] = f"%{q}%"
    sql += " ORDER BY sp.class_name, u.full_name"
    rows = db.execute(text(sql), params).mappings().all()
    return [dict(r) for r in rows]


"""Kamati: masomo (jina + msimbo) + yaunganishwa na madarasa — source of truth."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.classes import CLASS_ORDER
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee/subjects", tags=["committee-subjects"])
require_committee = require_role(UserRole.committee, UserRole.admin)


class SubjectIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=1, max_length=20)
    color: str | None = "#18453B"


class ClassSubjectIn(BaseModel):
    class_name: str
    subject_id: str


@router.get("")
def list_subjects(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(
        text("SELECT id, name, code, color FROM subjects ORDER BY name")
    ).mappings().all()
    return [dict(r) for r in rows]


@router.post("")
def create_subject(body: SubjectIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    code = body.code.strip().upper()
    name = body.name.strip()
    exists = db.execute(
        text("SELECT id FROM subjects WHERE lower(name)=lower(:n) OR upper(code)=:c"),
        {"n": name, "c": code},
    ).first()
    if exists:
        raise HTTPException(400, detail="Somo au msimbo tayari upo")
    sid = str(uuid.uuid4())
    db.execute(
        text(
            "INSERT INTO subjects (id, name, code, color, icon) VALUES (:id, :n, :c, :col, 'book')"
        ),
        {"id": sid, "n": name, "c": code, "col": body.color or "#18453B"},
    )
    db.commit()
    return {"id": sid, "name": name, "code": code}


@router.put("/{subject_id}")
def update_subject(
    subject_id: str,
    body: SubjectIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    n = db.execute(
        text("UPDATE subjects SET name=:n, code=:c, color=:col WHERE id=:id"),
        {
            "n": body.name.strip(),
            "c": body.code.strip().upper(),
            "col": body.color or "#18453B",
            "id": subject_id,
        },
    ).rowcount
    if not n:
        raise HTTPException(404, detail="Somo halipo")
    db.commit()
    return {"ok": True}


@router.delete("/{subject_id}")
def delete_subject(subject_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    db.execute(text("DELETE FROM class_subjects WHERE subject_id = :id"), {"id": subject_id})
    db.execute(text("DELETE FROM subjects WHERE id = :id"), {"id": subject_id})
    db.commit()
    return {"ok": True}


@router.get("/by-class")
def by_class(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    """Masomo kwa kila darasa (CLASS_ORDER)."""
    rows = db.execute(
        text(
            """
            SELECT cs.class_name, s.id AS subject_id, s.name AS subject_name, s.code
            FROM class_subjects cs
            JOIN subjects s ON s.id = cs.subject_id
            WHERE cs.is_active = true
            ORDER BY cs.class_name, s.name
            """
        )
    ).mappings().all()
    by: dict = {cn: [] for cn in CLASS_ORDER}
    for r in rows:
        cn = r["class_name"]
        if cn not in by:
            by[cn] = []
        by[cn].append(
            {"subject_id": r["subject_id"], "subject_name": r["subject_name"], "code": r["code"]}
        )
    return [{"class_name": cn, "subjects": by.get(cn, [])} for cn in (list(CLASS_ORDER) + [k for k in by if k not in CLASS_ORDER])]


@router.post("/assign")
def assign(body: ClassSubjectIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    if body.class_name not in CLASS_ORDER and not body.class_name.startswith("Darasa"):
        # still allow listed classes
        pass
    exists = db.execute(
        text("SELECT id FROM class_subjects WHERE class_name=:c AND subject_id=:s"),
        {"c": body.class_name, "s": body.subject_id},
    ).scalar()
    if exists:
        return {"ok": True, "id": exists, "note": "tayari"}
    cid = str(uuid.uuid4())
    db.execute(
        text(
            "INSERT INTO class_subjects (id, class_name, subject_id, is_active) VALUES (:id, :c, :s, true)"
        ),
        {"id": cid, "c": body.class_name, "s": body.subject_id},
    )
    db.commit()
    return {"ok": True, "id": cid}


@router.delete("/assign")
def unassign(
    class_name: str,
    subject_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_committee),
):
    db.execute(
        text("DELETE FROM class_subjects WHERE class_name=:c AND subject_id=:s"),
        {"c": class_name, "s": subject_id},
    )
    db.commit()
    return {"ok": True}


@router.get("/options")
def options_for_forms(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    """Orodha fupi kwa dropdowns (timetable, exams, teachers)."""
    subjects = db.execute(text("SELECT id, name, code FROM subjects ORDER BY name")).mappings().all()
    by = db.execute(
        text(
            """
            SELECT class_name, subject_id FROM class_subjects WHERE is_active = true
            """
        )
    ).mappings().all()
    return {
        "classes": list(CLASS_ORDER),
        "subjects": [dict(s) for s in subjects],
        "class_subject_ids": [dict(b) for b in by],
    }

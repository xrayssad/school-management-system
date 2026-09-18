from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.services.promotion import compute_and_apply

router = APIRouter(prefix="/committee/grades", tags=["committee-grades"])
require_committee = require_role(UserRole.committee, UserRole.admin)


class ScaleIn(BaseModel):
    class_name: str
    min_a: float = 75
    min_b: float = 65
    min_c: float = 50
    min_d: float = 40
    min_promote_average: float = 40
    fail_letter: str = "D"


@router.get("/scales")
def list_scales(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    try:
        return [dict(r) for r in db.execute(text("SELECT * FROM grade_scales ORDER BY class_name")).mappings().all()]
    except Exception:
        db.rollback()
        return []


@router.put("/scales")
def upsert_scale(body: ScaleIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    existing = db.execute(
        text("SELECT id FROM grade_scales WHERE class_name = :c"), {"c": body.class_name}
    ).first()
    if existing:
        db.execute(
            text(
                """
                UPDATE grade_scales SET min_a=:a, min_b=:b, min_c=:c, min_d=:d,
                  min_promote_average=:p, fail_letter=:f, updated_at=:u
                WHERE class_name=:cn
                """
            ),
            {
                "a": body.min_a, "b": body.min_b, "c": body.min_c, "d": body.min_d,
                "p": body.min_promote_average, "f": body.fail_letter.upper(),
                "u": datetime.utcnow(), "cn": body.class_name,
            },
        )
    else:
        import uuid
        db.execute(
            text(
                """
                INSERT INTO grade_scales
                  (id, class_name, min_a, min_b, min_c, min_d, min_promote_average, fail_letter, updated_at)
                VALUES (:id,:cn,:a,:b,:c,:d,:p,:f,:u)
                """
            ),
            {
                "id": str(uuid.uuid4()), "cn": body.class_name,
                "a": body.min_a, "b": body.min_b, "c": body.min_c, "d": body.min_d,
                "p": body.min_promote_average, "f": body.fail_letter.upper(),
                "u": datetime.utcnow(),
            },
        )
    db.commit()
    return {"ok": True}


@router.get("/pending")
def pending_exams(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    rows = db.execute(
        text(
            """
            SELECT e.id, e.title, e.class_name, e.exam_date, s.name AS subject_name,
                   COUNT(g.id) AS grade_count
            FROM grades g
            JOIN exams e ON e.id = g.exam_id
            LEFT JOIN subjects s ON s.id = e.subject_id
            WHERE g.status = 'submitted'
            GROUP BY e.id, e.title, e.class_name, e.exam_date, s.name
            ORDER BY e.exam_date DESC NULLS LAST
            """
        )
    ).mappings().all()
    return [dict(r) for r in rows]


@router.post("/exam/{exam_id}/publish")
def publish_exam(exam_id: str, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    n = db.execute(
        text(
            """
            UPDATE grades SET status = 'published', published_at = :t
            WHERE exam_id = :e AND status IN ('submitted', 'draft')
            """
        ),
        {"e": exam_id, "t": datetime.utcnow()},
    ).rowcount
    db.commit()
    promo = compute_and_apply(db, term="Muhula 2", apply=True)
    return {"published": n, "promotion": promo.get("summary")}


@router.post("/publish-all-submitted")
def publish_all(db: Session = Depends(get_db), _: User = Depends(require_committee)):
    n = db.execute(
        text(
            """
            UPDATE grades SET status = 'published', published_at = :t
            WHERE status IN ('submitted', 'draft')
            """
        ),
        {"t": datetime.utcnow()},
    ).rowcount
    db.commit()
    promo = compute_and_apply(db, term="Muhula 2", apply=True)
    return {"published": n, "promotion": promo.get("summary")}

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.services.promotion import compute_and_apply

router = APIRouter(prefix="/committee/promotion", tags=["committee-promotion"])
require_committee = require_role(UserRole.committee, UserRole.admin)


class ApplyIn(BaseModel):
    term: str = "Muhula 2"


@router.get("/preview")
def preview(term: str = Query("Muhula 2"), db: Session = Depends(get_db), _: User = Depends(require_committee)):
    try:
        return compute_and_apply(db, term=term, apply=False)
    except Exception as e:
        db.rollback()
        return {
            "term": term,
            "applied": False,
            "class_order": [],
            "summary": {"repeated": 0, "promoted": 0, "graduated": 0, "total": 0},
            "items": [],
            "error": str(e),
        }


@router.post("/apply")
def apply(body: ApplyIn, db: Session = Depends(get_db), _: User = Depends(require_committee)):
    """Mwongozo wa mkono — kawaida hutokea otomatiki baada ya kuidhinisha matokeo."""
    try:
        return compute_and_apply(db, term=body.term, apply=True)
    except Exception as e:
        db.rollback()
        return {
            "term": body.term,
            "applied": False,
            "class_order": [],
            "summary": {"repeated": 0, "promoted": 0, "graduated": 0, "total": 0},
            "items": [],
            "error": str(e),
        }

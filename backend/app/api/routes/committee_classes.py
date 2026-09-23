
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.classes import CLASS_ORDER
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/committee", tags=["committee-classes"])


@router.get("/classes")
def list_classes(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.committee, UserRole.admin)),
):
    """Orodha kamili mara moja: Maandalizi .. Darasa la 5."""
    counts = {
        r[0]: int(r[1])
        for r in db.execute(
            text(
                """
                SELECT sp.class_name, COUNT(*)
                FROM student_profiles sp
                JOIN users u ON u.id = sp.user_id
                WHERE u.is_active IS true AND sp.class_name IS NOT NULL
                GROUP BY sp.class_name
                """
            )
        ).fetchall()
    }
    # unique preserve order
    seen = set()
    out = []
    for cn in CLASS_ORDER:
        if cn in seen:
            continue
        seen.add(cn)
        out.append({"id": cn, "name": cn, "student_count": counts.get(cn, 0)})
    return out

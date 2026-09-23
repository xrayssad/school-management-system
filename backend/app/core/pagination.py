from fastapi import Query
from app.core.security_limits import DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT

def page_params(
    limit: int = Query(DEFAULT_PAGE_LIMIT, ge=1, le=MAX_PAGE_LIMIT),
    offset: int = Query(0, ge=0),
) -> tuple[int, int]:
    return limit, offset

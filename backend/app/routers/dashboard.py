from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.auth import get_current_user
from app.models import User, Case

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = select(Case).where(Case.analyst_id == current_user.id)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar()

    open_result = await db.execute(
        select(func.count()).select_from(base.where(Case.status == "OPEN").subquery())
    )
    open_count = open_result.scalar()

    critical_result = await db.execute(
        select(func.count()).select_from(base.where(Case.severity == "CRITICAL").subquery())
    )
    critical_count = critical_result.scalar()

    closed_result = await db.execute(
        select(func.count()).select_from(base.where(Case.status == "CLOSED").subquery())
    )
    closed_count = closed_result.scalar()

    recent_result = await db.execute(
        select(Case)
        .where(Case.analyst_id == current_user.id)
        .order_by(Case.created_at.desc())
        .limit(5)
    )
    recent = recent_result.scalars().all()

    return {
        "total_cases": total,
        "open_cases": open_count,
        "critical_cases": critical_count,
        "closed_cases": closed_count,
        "recent_cases": [
            {
                "id": c.id,
                "title": c.title,
                "severity": c.severity,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in recent
        ],
    }

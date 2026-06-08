from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_user
from app.models import User
from app.services.enrichment_service import enrich_ioc

router = APIRouter(prefix="/api/enrich", tags=["enrichment"])

class EnrichRequest(BaseModel):
    ioc: str
    ioc_type: Optional[str] = None

@router.post("")
async def enrich(
    payload: EnrichRequest,
    current_user: User = Depends(get_current_user),
):
    return await enrich_ioc(payload.ioc, payload.ioc_type)

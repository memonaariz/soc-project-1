from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth import get_current_user
from app.models import User
from app.services.triage_service import triage_alert
from app.services.playbook_service import get_playbook

router = APIRouter(prefix="/api/triage", tags=["triage"])

class TriageRequest(BaseModel):
    alert_text: str

@router.post("")
async def analyze_alert(
    payload: TriageRequest,
    current_user: User = Depends(get_current_user),
):
    result = await triage_alert(payload.alert_text)
    playbook = get_playbook(payload.alert_text, result["mitre_techniques"])
    result["playbook"] = playbook
    return result

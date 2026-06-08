import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.auth import get_current_user
from app.models import User, Case
from app.services.triage_service import triage_alert
from app.services.playbook_service import get_playbook

router = APIRouter(prefix="/api/cases", tags=["cases"])

class CaseCreate(BaseModel):
    title: str
    raw_alert: str

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

@router.post("", status_code=201)
async def create_case(
    payload: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    triage = await triage_alert(payload.raw_alert)
    playbook = get_playbook(payload.raw_alert, triage["mitre_techniques"])

    case = Case(
        title=payload.title,
        raw_alert=payload.raw_alert,
        severity=triage["severity"],
        mitre_techniques=json.dumps(triage["mitre_techniques"]),
        triage_summary=triage["triage_summary"],
        playbook=json.dumps(playbook),
        analyst_id=current_user.id,
    )
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return _serialize_case(case)

@router.get("")
async def list_cases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Case).where(Case.analyst_id == current_user.id).order_by(Case.created_at.desc())
    )
    cases = result.scalars().all()
    return [_serialize_case(c) for c in cases]

@router.get("/{case_id}")
async def get_case(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = await _get_owned_case(case_id, current_user.id, db)
    return _serialize_case(case)

@router.patch("/{case_id}")
async def update_case(
    case_id: int,
    payload: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = await _get_owned_case(case_id, current_user.id, db)
    if payload.title is not None:
        case.title = payload.title
    if payload.status is not None:
        case.status = payload.status
    if payload.notes is not None:
        case.notes = payload.notes
    await db.commit()
    await db.refresh(case)
    return _serialize_case(case)

@router.delete("/{case_id}", status_code=204)
async def delete_case(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = await _get_owned_case(case_id, current_user.id, db)
    await db.delete(case)
    await db.commit()

async def _get_owned_case(case_id: int, user_id: int, db: AsyncSession) -> Case:
    result = await db.execute(
        select(Case).where(Case.id == case_id, Case.analyst_id == user_id)
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

def _serialize_case(case: Case) -> dict:
    return {
        "id": case.id,
        "title": case.title,
        "severity": case.severity,
        "status": case.status,
        "raw_alert": case.raw_alert,
        "mitre_techniques": json.loads(case.mitre_techniques or "[]"),
        "triage_summary": case.triage_summary,
        "playbook": json.loads(case.playbook or "{}"),
        "notes": case.notes,
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "updated_at": case.updated_at.isoformat() if case.updated_at else None,
    }

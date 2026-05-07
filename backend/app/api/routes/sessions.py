from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import SessionCreate
from app.core.security import get_current_user, require_doctor
from app.db.database import get_database
from typing import List

router = APIRouter(prefix="/sessions", tags=["Sessions"])


def fmt_session(s, patient_name=None) -> dict:
    return {
        "id": str(s["_id"]),
        "patient_id": s["patient_id"],
        "patient_name": patient_name or s.get("patient_name", ""),
        "doctor_id": s["doctor_id"],
        "status": s["status"],
        "total_score": s.get("total_score"),
        "max_score": 45,
        "started_at": s.get("started_at"),
        "completed_at": s.get("completed_at"),
        "notes": s.get("notes"),
        "created_at": s["created_at"],
    }


@router.post("/", response_model=dict)
async def create_session(
    body: SessionCreate,
    doctor=Depends(require_doctor),
    db=Depends(get_database)
):
    patient = await db.users.find_one({"_id": ObjectId(body.patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doc = {
        "patient_id": body.patient_id,
        "patient_name": patient["name"],
        "doctor_id": str(doctor["_id"]),
        "status": "pending",
        "total_score": None,
        "notes": body.notes,
        "created_at": datetime.utcnow(),
        "started_at": None,
        "completed_at": None,
    }
    result = await db.sessions.insert_one(doc)
    doc["_id"] = result.inserted_id
    return fmt_session(doc, patient["name"])


@router.get("/my", response_model=List[dict])
async def my_sessions(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    """Patient sees their own sessions."""
    sessions = await db.sessions.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("created_at", -1).to_list(50)
    return [fmt_session(s) for s in sessions]


@router.get("/doctor/all", response_model=List[dict])
async def doctor_sessions(
    doctor=Depends(require_doctor),
    db=Depends(get_database)
):
    sessions = await db.sessions.find(
        {"doctor_id": str(doctor["_id"])}
    ).sort("created_at", -1).to_list(200)
    return [fmt_session(s) for s in sessions]


@router.get("/{session_id}", response_model=dict)
async def get_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return fmt_session(session)


@router.patch("/{session_id}/start", response_model=dict)
async def start_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "in_progress", "started_at": datetime.utcnow()}}
    )
    session["status"] = "in_progress"
    session["started_at"] = datetime.utcnow()
    return fmt_session(session)


@router.patch("/{session_id}/complete", response_model=dict)
async def complete_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    # Calculate total score from results
    results = await db.results.find({"session_id": session_id}).to_list(20)
    total = sum(r.get("score", 0) for r in results)

    await db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {
            "status": "completed",
            "total_score": total,
            "completed_at": datetime.utcnow()
        }}
    )
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    return fmt_session(session)

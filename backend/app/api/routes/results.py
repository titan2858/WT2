from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import TestResultSubmit, ClockScoreUpdate
from app.core.security import get_current_user, require_doctor
from app.db.database import get_database
from typing import List

router = APIRouter(prefix="/results", tags=["Results"])


def fmt_result(r) -> dict:
    return {
        "id": str(r["_id"]),
        "session_id": r["session_id"],
        "test_name": r["test_name"],
        "test_index": r["test_index"],
        "score": r["score"],
        "max_score": r["max_score"],
        "time_taken_seconds": r["time_taken_seconds"],
        "doctor_review_required": r.get("doctor_review_required", False),
        "doctor_score": r.get("doctor_score"),
        "responses": r.get("responses", []),
        "recorded_at": r["recorded_at"],
    }


@router.post("/", response_model=dict)
async def submit_result(
    body: TestResultSubmit,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    # Check session exists
    session = await db.sessions.find_one({"_id": ObjectId(body.session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check for duplicate (same test in same session)
    existing = await db.results.find_one({
        "session_id": body.session_id,
        "test_index": body.test_index
    })
    if existing:
        # Update instead of duplicate
        await db.results.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "score": body.score,
                "time_taken_seconds": body.time_taken_seconds,
                "responses": body.responses,
            }}
        )
        updated = await db.results.find_one({"_id": existing["_id"]})
        return fmt_result(updated)

    doc = {
        "session_id": body.session_id,
        "test_name": body.test_name,
        "test_index": body.test_index,
        "score": body.score,
        "max_score": body.max_score,
        "time_taken_seconds": body.time_taken_seconds,
        "doctor_review_required": body.doctor_review_required,
        "doctor_score": None,
        "responses": body.responses or [],
        "recorded_at": datetime.utcnow(),
    }
    result = await db.results.insert_one(doc)
    doc["_id"] = result.inserted_id
    return fmt_result(doc)


@router.get("/session/{session_id}", response_model=List[dict])
async def get_session_results(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    results = await db.results.find(
        {"session_id": session_id}
    ).sort("test_index", 1).to_list(20)
    return [fmt_result(r) for r in results]


@router.get("/report/{session_id}", response_model=dict)
async def get_report(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    results = await db.results.find(
        {"session_id": session_id}
    ).sort("test_index", 1).to_list(20)

    total = sum(r.get("score", 0) for r in results)
    percentage = round((total / 45) * 100, 1)

    if percentage >= 89:
        status_label, color = "Normal Cognitive Function", "green"
    elif percentage >= 67:
        status_label, color = "Mild Cognitive Concern", "yellow"
    elif percentage >= 45:
        status_label, color = "Moderate Concern — Consult a Doctor", "orange"
    else:
        status_label, color = "Significant Concern — Immediate Review Recommended", "red"

    return {
        "session_id": session_id,
        "patient_name": session.get("patient_name", ""),
        "total_score": total,
        "max_score": 45,
        "percentage": percentage,
        "status": status_label,
        "status_color": color,
        "results": [fmt_result(r) for r in results],
        "completed_at": session.get("completed_at"),
    }


@router.patch("/{result_id}/doctor-score")
async def update_doctor_score(
    result_id: str,
    body: ClockScoreUpdate,
    doctor=Depends(require_doctor),
    db=Depends(get_database)
):
    await db.results.update_one(
        {"_id": ObjectId(result_id)},
        {"$set": {"doctor_score": body.score, "score": body.score}}
    )
    return {"message": "Score updated"}

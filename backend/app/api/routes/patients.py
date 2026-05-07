from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import PatientCreate, PatientOut
from app.core.security import get_current_user, require_doctor, hash_password
from app.db.database import get_database
from typing import List

router = APIRouter(prefix="/patients", tags=["Patients"])


def fmt(p) -> dict:
    return {
        "id": str(p["_id"]),
        "name": p["name"],
        "email": p["email"],
        "date_of_birth": p.get("date_of_birth"),
        "gender": p.get("gender"),
        "created_at": p.get("created_at", datetime.utcnow()),
    }


@router.get("/", response_model=List[dict])
async def list_patients(
    doctor=Depends(require_doctor),
    db=Depends(get_database)
):
    doctor_id = str(doctor["_id"])
    patients = await db.users.find({
        "role": "patient",
        "assigned_doctor_id": doctor_id
    }).to_list(200)
    return [fmt(p) for p in patients]


@router.post("/", response_model=dict)
async def create_patient(
    body: PatientCreate,
    doctor=Depends(require_doctor),
    db=Depends(get_database)
):
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name": body.name,
        "email": body.email,
        "hashed_password": hash_password(body.password),
        "role": "patient",
        "date_of_birth": body.date_of_birth,
        "gender": body.gender,
        "assigned_doctor_id": str(doctor["_id"]),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return fmt(doc)


@router.get("/{patient_id}", response_model=dict)
async def get_patient(
    patient_id: str,
    doctor=Depends(require_doctor),
    db=Depends(get_database)
):
    patient = await db.users.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return fmt(patient)

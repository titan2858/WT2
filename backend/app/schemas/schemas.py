from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


# ─── Enums ───────────────────────────────────────────────
class UserRole(str, Enum):
    doctor = "doctor"
    patient = "patient"


class SessionStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


# ─── Auth Schemas ─────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


# ─── User Schemas ─────────────────────────────────────────
class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str


# ─── Patient Schemas ──────────────────────────────────────
class PatientCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None


class PatientOut(BaseModel):
    id: str
    name: str
    email: str
    date_of_birth: Optional[str]
    gender: Optional[str]
    created_at: datetime


# ─── Test Session Schemas ─────────────────────────────────
class SessionCreate(BaseModel):
    patient_id: str
    notes: Optional[str] = None


class SessionOut(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str]
    doctor_id: str
    status: str
    total_score: Optional[int]
    max_score: int = 45
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime


# ─── Test Result Schemas ──────────────────────────────────
class TestResultSubmit(BaseModel):
    session_id: str
    test_name: str
    test_index: int  # 0–7
    score: int
    max_score: int
    time_taken_seconds: int
    responses: Optional[List[Dict[str, Any]]] = []
    doctor_review_required: bool = False


class TestResultOut(BaseModel):
    id: str
    session_id: str
    test_name: str
    test_index: int
    score: int
    max_score: int
    time_taken_seconds: int
    doctor_review_required: bool
    doctor_score: Optional[int]
    recorded_at: datetime


# ─── Score Report ─────────────────────────────────────────
class ScoreReport(BaseModel):
    session_id: str
    patient_name: str
    total_score: int
    max_score: int = 45
    percentage: float
    status: str
    status_color: str
    results: List[TestResultOut]
    completed_at: Optional[datetime]


# ─── Clock Drawing ────────────────────────────────────────
class ClockScoreUpdate(BaseModel):
    score: int = Field(..., ge=0, le=5)

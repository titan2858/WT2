from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import SignupRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.db.database import get_database

router = APIRouter(prefix="/auth", tags=["Auth"])


def user_to_dict(user) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest, db=Depends(get_database)):
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": body.name,
        "email": body.email,
        "hashed_password": hash_password(body.password),
        "role": body.role,
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=user_to_dict(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db=Depends(get_database)):
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=user_to_dict(user))


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return user_to_dict(current_user)

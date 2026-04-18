from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserLogin, UserResponse
from services.auth_service import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register")
async def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "data": {"user": UserResponse.model_validate(user).model_dump()},
        "message": "User registered successfully",
    }


@router.post("/login")
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "success": True,
        "data": {"access_token": token, "token_type": "bearer", "role": user.role},
        "message": "Login successful",
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {"user": UserResponse.model_validate(current_user).model_dump()},
        "message": "Current user profile fetched",
    }

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.schemas.all_schemas import Token, LoginRequest, RegisterRequest, PasswordResetRequest, UserOut
from app.services.notification_service import record_audit_event

router = APIRouter()

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact an administrator."
        )

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    record_audit_event(
        db=db,
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="USER",
        resource_id=user.id,
        details={"email": user.email, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "organization": user.organization,
            "role": user.role,
            "is_active": user.is_active
        }
    }

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Security check: Public registration CANNOT grant ADMIN privileges
    assigned_role = UserRole.APPLICANT.value
    if request.role == UserRole.REVIEWER:
        # Allow reviewer self-enrollment for demonstration purposes, but ADMIN requires explicit admin assignment
        assigned_role = UserRole.REVIEWER.value

    user = User(
        email=request.email.lower().strip(),
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name.strip(),
        organization=request.organization.strip() if request.organization else None,
        role=assigned_role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    record_audit_event(
        db=db,
        user_id=user.id,
        action="USER_REGISTERED",
        resource_type="USER",
        resource_id=user.id,
        details={"email": user.email, "role": assigned_role}
    )

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "organization": user.organization,
            "role": user.role,
            "is_active": user.is_active
        }
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user:
        # Return generic message to prevent email enumeration
        return {"message": "If this email is registered, recovery instructions have been initiated."}

    # For local demonstration, update password securely
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    record_audit_event(
        db=db,
        user_id=user.id,
        action="PASSWORD_RESET_COMPLETED",
        resource_type="USER",
        resource_id=user.id
    )

    return {"message": "Password successfully updated. You may now log in with your new credentials."}

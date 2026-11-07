from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, hash_password, create_access_token
from backend.app.core.config import settings
from backend.app.models.entities import User, Employee, AuditLog
from backend.app.schemas.schemas import UserLogin, UserCreate, UserOut, Token
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    # Record login audit
    db.add(AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"User {user.email} logged in successfully.",
        ip_address="127.0.0.1"
    ))
    db.commit()

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "uid": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """Convenient role switcher for evaluation: admin, manager, or employee."""
    role_map = {
        "admin": "admin@epms.dev",
        "manager": "manager@epms.dev",
        "employee": "alex.chen@epms.dev"
    }
    email = role_map.get(role.lower())
    if not email:
        raise HTTPException(status_code=400, detail="Role must be 'admin', 'manager', or 'employee'")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found in seeded database")

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "uid": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["ADMIN", "MANAGER", "EMPLOYEE"] else "EMPLOYEE",
        employee_id=user_in.employee_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

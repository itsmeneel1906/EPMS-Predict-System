from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import decode_access_token
from backend.app.core.config import settings
from backend.app.models.entities import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        # If in DEMO_MODE, return demo manager for frictionless evaluation if no token provided
        if getattr(settings, "DEMO_MODE", False):
            demo_user = db.query(User).filter(User.email == "manager@epms.dev").first()
            if demo_user:
                return demo_user
        raise credentials_exception
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: Optional[str] = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    return current_user

def require_role(allowed_roles: List[str]):
    """Decorator dependency to enforce strict Role-Based Access Control (RBAC)."""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The current user does not have administrative privileges"
        )
    return current_user

def require_manager_or_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires Manager or Administrator role"
        )
    return current_user

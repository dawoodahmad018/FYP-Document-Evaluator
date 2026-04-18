from fastapi import Depends

from models.user import User
from services.auth_service import get_current_admin


def admin_required(current_admin: User = Depends(get_current_admin)) -> User:
    return current_admin

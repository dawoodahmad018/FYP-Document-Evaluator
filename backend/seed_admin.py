from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models.user import User
from services.auth_service import get_password_hash

ADMIN_EMAIL = "admin@fyp.com"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME = "System Admin"


def seed_admin(db: Session):
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if existing:
        print("Admin user already exists")
        return

    admin = User(
        username=ADMIN_NAME,
        email=ADMIN_EMAIL,
        hashed_password=get_password_hash(ADMIN_PASSWORD),
        role="admin",
    )
    db.add(admin)
    db.commit()
    print("Default admin user created: admin@fyp.com / Admin@123")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        seed_admin(session)
    finally:
        session.close()

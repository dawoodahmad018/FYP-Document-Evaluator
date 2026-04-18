from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(String(20), nullable=False, default="processing")

    user = relationship("User", back_populates="documents")
    report = relationship("Report", back_populates="document", uselist=False, cascade="all, delete-orphan")

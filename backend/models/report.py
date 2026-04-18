from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    grammar_score = Column(Float, nullable=False, default=0)
    structure_score = Column(Float, nullable=False, default=0)
    relevance_score = Column(Float, nullable=False, default=0)
    ai_detect_score = Column(Float, nullable=False, default=0)
    formatting_score = Column(Float, nullable=False, default=0)
    overall_score = Column(Float, nullable=False, default=0)

    grammar_feedback = Column(Text, nullable=False, default="")
    structure_feedback = Column(Text, nullable=False, default="")
    relevance_feedback = Column(Text, nullable=False, default="")
    ai_detect_feedback = Column(Text, nullable=False, default="")
    formatting_feedback = Column(Text, nullable=False, default="")
    summary = Column(Text, nullable=False, default="")

    questions_answers = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    pdf_path = Column(Text, nullable=True)

    document = relationship("Document", back_populates="report")
    user = relationship("User", back_populates="reports")

from datetime import datetime
from typing import List

from pydantic import BaseModel


class QAItem(BaseModel):
    question: str
    answer: str


class ReportResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    grammar_score: float
    structure_score: float
    relevance_score: float
    ai_detect_score: float
    formatting_score: float
    overall_score: float
    grammar_feedback: str
    structure_feedback: str
    relevance_feedback: str
    ai_detect_feedback: str
    formatting_feedback: str
    summary: str
    questions_answers: List[QAItem]
    created_at: datetime
    pdf_path: str | None

    class Config:
        from_attributes = True

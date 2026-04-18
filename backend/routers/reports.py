from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models.document import Document
from models.report import Report
from models.user import User
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/")
async def get_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Report, Document).join(Document, Report.document_id == Document.id)
    if current_user.role != "admin":
        query = query.filter(Report.user_id == current_user.id)

    rows = query.order_by(Report.created_at.desc()).all()
    reports = [
        {
            "id": report.id,
            "document_id": report.document_id,
            "filename": document.filename,
            "doc_type": document.doc_type,
            "uploaded_at": document.uploaded_at,
            "status": document.status,
            "overall_score": report.overall_score,
            "created_at": report.created_at,
            "pdf_available": bool(report.pdf_path),
        }
        for report, document in rows
    ]

    return {"success": True, "data": {"reports": reports}, "message": "Reports fetched"}


@router.get("/{report_id}")
async def get_report(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    document = db.query(Document).filter(Document.id == report.document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    payload = {
        "id": report.id,
        "document_id": report.document_id,
        "user_id": report.user_id,
        "filename": document.filename,
        "doc_type": document.doc_type,
        "status": document.status,
        "grammar_score": report.grammar_score,
        "structure_score": report.structure_score,
        "relevance_score": report.relevance_score,
        "ai_detect_score": report.ai_detect_score,
        "formatting_score": report.formatting_score,
        "overall_score": report.overall_score,
        "grammar_feedback": report.grammar_feedback,
        "structure_feedback": report.structure_feedback,
        "relevance_feedback": report.relevance_feedback,
        "ai_detect_feedback": report.ai_detect_feedback,
        "formatting_feedback": report.formatting_feedback,
        "summary": report.summary,
        "questions_answers": report.questions_answers,
        "created_at": report.created_at,
        "pdf_path": report.pdf_path,
    }

    return {"success": True, "data": {"report": payload}, "message": "Report fetched"}


@router.get("/{report_id}/pdf")
async def download_pdf(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not report.pdf_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF report not generated yet")

    pdf_path = Path(report.pdf_path)
    if not pdf_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file not found")

    return FileResponse(path=str(pdf_path), filename=pdf_path.name, media_type="application/pdf")

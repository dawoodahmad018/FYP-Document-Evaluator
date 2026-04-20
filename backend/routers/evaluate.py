from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database import SessionLocal, get_db
from models.document import Document
from models.report import Report
from models.user import User
from services.auth_service import get_current_user
from services.claude_service import evaluate_document
from services.doc_parser import extract_text
from services.pdf_generator import generate_report_pdf

router = APIRouter(prefix="/api/evaluate", tags=["Evaluate"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_DOC_TYPES = {"SRS", "SDD", "Scope", "FYP_Proposal", "Other"}
MAX_FILE_SIZE = 10 * 1024 * 1024
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "generated_reports"


def _process_evaluation(report_id: int, document_id: int):
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        document = db.query(Document).filter(Document.id == document_id).first()

        if not report or not document:
            return

        text = extract_text(document.file_path)
        if not text:
            raise ValueError("No readable text found in document")

        result = evaluate_document(text=text, doc_type=document.doc_type)

        report.grammar_score = result["grammar_score"]
        report.grammar_feedback = result["grammar_feedback"]
        report.structure_score = result["structure_score"]
        report.structure_feedback = result["structure_feedback"]
        report.formatting_score = result["formatting_score"]
        report.formatting_feedback = result["formatting_feedback"]
        report.relevance_score = result["relevance_score"]
        report.relevance_feedback = result["relevance_feedback"]
        report.ai_detect_score = result["ai_detect_score"]
        report.ai_detect_feedback = result["ai_detect_feedback"]
        report.overall_score = result["overall_score"]
        report.summary = result["summary"]
        report.questions_answers = result["questions_answers"]

        pdf_name = f"report_{report.id}_{uuid4().hex}.pdf"
        pdf_path = REPORT_DIR / pdf_name

        generated_pdf = generate_report_pdf(
            {
                "filename": document.filename,
                "doc_type": document.doc_type,
                "student_name": document.user.username,
                "grammar_score": report.grammar_score,
                "structure_score": report.structure_score,
                "formatting_score": report.formatting_score,
                "relevance_score": report.relevance_score,
                "ai_detect_score": report.ai_detect_score,
                "overall_score": report.overall_score,
                "grammar_feedback": report.grammar_feedback,
                "structure_feedback": report.structure_feedback,
                "formatting_feedback": report.formatting_feedback,
                "relevance_feedback": report.relevance_feedback,
                "ai_detect_feedback": report.ai_detect_feedback,
                "questions_answers": report.questions_answers,
                "summary": report.summary,
            },
            str(pdf_path),
        )

        report.pdf_path = generated_pdf
        document.status = "completed"

        db.commit()

    except Exception as e:
        print(f"[EVALUATION ERROR] Document {document_id}: {e}")

        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = "failed"
            db.commit()

    finally:
        db.close()


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document type")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and DOCX are allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 10MB limit")

    unique_name = f"{uuid4().hex}{suffix}"
    destination = UPLOAD_DIR / unique_name
    destination.write_bytes(content)

    document = Document(
        user_id=current_user.id,
        filename=file.filename or unique_name,
        doc_type=doc_type,
        file_path=str(destination),
        uploaded_at=datetime.utcnow(),
        status="processing",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    report = Report(document_id=document.id, user_id=current_user.id)
    db.add(report)
    db.commit()
    db.refresh(report)

    background_tasks.add_task(_process_evaluation, report.id, document.id)

    return {
        "success": True,
        "data": {"report_id": report.id, "document_id": document.id},
        "message": "Document uploaded and evaluation started",
    }


@router.get("/status/{report_id}")
async def evaluation_status(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    document = db.query(Document).filter(Document.id == report.document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return {
        "success": True,
        "data": {
            "report_id": report.id,
            "document_id": document.id,
            "status": document.status,
            "overall_score": report.overall_score,
        },
        "message": "Evaluation status fetched",
    }

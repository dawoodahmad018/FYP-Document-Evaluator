from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth_middleware import admin_required
from models.document import Document
from models.report import Report
from models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(admin_required)])


@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    payload = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
        }
        for u in users
    ]
    return {"success": True, "data": {"users": payload}, "message": "Users fetched"}


@router.get("/documents")
async def list_documents(db: Session = Depends(get_db)):
    rows = db.query(Document, User, Report).join(User, Document.user_id == User.id).outerjoin(Report, Report.document_id == Document.id).all()
    payload = [
        {
            "id": d.id,
            "user": u.username,
            "user_email": u.email,
            "filename": d.filename,
            "doc_type": d.doc_type,
            "status": d.status,
            "uploaded_at": d.uploaded_at,
            "overall_score": r.overall_score if r else 0,
        }
        for d, u, r in rows
    ]
    return {"success": True, "data": {"documents": payload}, "message": "Documents fetched"}


@router.get("/reports")
async def list_reports(db: Session = Depends(get_db)):
    rows = db.query(Report, User, Document).join(User, Report.user_id == User.id).join(Document, Report.document_id == Document.id).all()
    payload = [
        {
            "id": r.id,
            "user": u.username,
            "email": u.email,
            "filename": d.filename,
            "doc_type": d.doc_type,
            "overall_score": r.overall_score,
            "created_at": r.created_at,
        }
        for r, u, d in rows
    ]
    return {"success": True, "data": {"reports": payload}, "message": "Reports fetched"}


@router.get("/stats")
async def dashboard_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_docs = db.query(func.count(Document.id)).scalar() or 0
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    avg_overall_score = db.query(func.avg(Report.overall_score)).scalar() or 0

    rows = db.query(Document.doc_type, func.count(Document.id)).group_by(Document.doc_type).all()
    docs_by_type = {doc_type: count for doc_type, count in rows}

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_docs": total_docs,
            "total_reports": total_reports,
            "avg_overall_score": round(float(avg_overall_score), 2),
            "docs_by_type": docs_by_type,
        },
        "message": "Admin stats fetched",
    }


@router.delete("/user/{user_id}")
async def delete_user(user_id: int, current_admin: User = Depends(admin_required), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete own account")

    db.delete(user)
    db.commit()
    return {"success": True, "data": {"deleted_user_id": user_id}, "message": "User deleted"}

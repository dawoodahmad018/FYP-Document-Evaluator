from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import Base, engine
from routers import admin, auth, evaluate, reports

app = FastAPI(title="FYP Document Evaluator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    Path("uploads").mkdir(parents=True, exist_ok=True)
    Path("generated_reports").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "data": {}, "message": str(exc.detail)})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"success": False, "data": {}, "message": str(exc.errors())})


@app.exception_handler(Exception)
async def generic_exception_handler(_, exc: Exception):
    return JSONResponse(status_code=500, content={"success": False, "data": {}, "message": f"Internal server error: {exc}"})


@app.get("/")
async def health_check():
    return {"success": True, "data": {"service": "FYP Document Evaluator API"}, "message": "Service running"}


app.include_router(auth.router)
app.include_router(evaluate.router)
app.include_router(reports.router)
app.include_router(admin.router)

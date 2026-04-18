# FYP Document Evaluator (AI-Powered)

A production-ready full-stack web application to evaluate Final Year Project documents using FastAPI, React, and Google Gemini.

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy ORM, Alembic
- Database: SQLite (dev), PostgreSQL (prod via `DATABASE_URL`)
- Auth: JWT (`python-jose`) + bcrypt (`passlib`)
- AI: Google Gemini (`gemini-1.5-flash`)
- Parsing: PyMuPDF for PDF, python-docx for DOCX
- PDF report: reportlab
- Frontend: React 18, Vite, TailwindCSS, Axios, React Router v6

## Project Structure

- backend/: API, models, services, migrations, seed script
- frontend/: React app with student and admin dashboards

## Backend Setup

1. Open terminal in `fyp-evaluator/backend`
2. Create venv and install dependencies:
   - `python -m venv .venv`
   - `.venv\\Scripts\\activate`
   - `pip install -r requirements.txt`
3. Create environment file:
   - `copy .env.example .env`
4. Run migration:
   - `alembic upgrade head`
5. Seed default admin user:
   - `python seed_admin.py`
6. Start backend:
   - `uvicorn main:app --reload`

Backend runs on `http://localhost:8000`

## Frontend Setup

1. Open terminal in `fyp-evaluator/frontend`
2. Install packages:
   - `npm install`
3. Start app:
   - `npm run dev`

Frontend runs on `http://localhost:5173`

## Default Admin Credentials

- Email: `admin@fyp.com`
- Password: `Admin@123`

## Environment Variables

Required in `backend/.env`:

- `DATABASE_URL`
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `FRONTEND_ORIGIN`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Evaluate
- `POST /api/evaluate/upload`
- `GET /api/evaluate/status/{report_id}`

### Reports
- `GET /api/reports/`
- `GET /api/reports/{id}`
- `GET /api/reports/{id}/pdf`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/documents`
- `GET /api/admin/reports`
- `GET /api/admin/stats`
- `DELETE /api/admin/user/{id}`

## Security Implemented

- JWT tokens with 24-hour expiration
- Bcrypt hashing with cost factor 12
- Role-checked admin routes
- Student-only ownership access for reports and documents
- Upload validation: only PDF/DOCX, max 10MB
- Secrets loaded from environment variables

## Notes

- Evaluation status transitions: `processing -> completed|failed`
- Uploaded files are stored in `backend/uploads/`
- Generated PDF reports are stored in `backend/generated_reports/`

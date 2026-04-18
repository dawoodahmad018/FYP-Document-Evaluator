"""initial tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-04-17 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False, server_default="student"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("doc_type", sa.String(length=50), nullable=False),
        sa.Column("file_path", sa.String(length=500), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="processing"),
    )
    op.create_index("ix_documents_id", "documents", ["id"])

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("grammar_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("structure_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("relevance_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("ai_detect_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("formatting_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("overall_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("grammar_feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("structure_feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("relevance_feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("ai_detect_feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("formatting_feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("questions_answers", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("pdf_path", sa.Text(), nullable=True),
    )
    op.create_index("ix_reports_id", "reports", ["id"])


def downgrade() -> None:
    op.drop_index("ix_reports_id", table_name="reports")
    op.drop_table("reports")
    op.drop_index("ix_documents_id", table_name="documents")
    op.drop_table("documents")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")

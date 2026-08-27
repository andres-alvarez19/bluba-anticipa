"""add children table

Revision ID: 20260826_0002
Revises: 20260826_0001
Create Date: 2026-08-26
"""
from alembic import op
import sqlalchemy as sa


revision = "20260826_0002"
down_revision = "20260826_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "children",
        sa.Column("id", sa.String(length=128), nullable=False),
        sa.Column("display_name", sa.String(length=160), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("children")

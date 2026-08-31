"""add observation drafts

Revision ID: 20260830_0003
Revises: 20260826_0002
Create Date: 2026-08-30
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260830_0003"
down_revision = "20260826_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "observation_drafts",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("child_id", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("synthetic", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("idempotency_key", sa.String(length=128), nullable=True),
        sa.Column("idempotency_fingerprint", sa.String(length=64), nullable=True),
        sa.Column("confirmation_idempotency_key", sa.String(length=128), nullable=True),
        sa.Column("confirmation_fingerprint", sa.String(length=64), nullable=True),
        sa.Column("confirmed_record_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_observation_drafts_child_id", "observation_drafts", ["child_id"])
    op.create_index(
        "uq_observation_drafts_idempotency_key",
        "observation_drafts",
        ["idempotency_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_observation_drafts_idempotency_key", table_name="observation_drafts")
    op.drop_index("ix_observation_drafts_child_id", table_name="observation_drafts")
    op.drop_table("observation_drafts")

"""initial persistence tables

Revision ID: 20260826_0001
Revises:
Create Date: 2026-08-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260826_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "daily_records",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("child_id", sa.String(length=128), nullable=False),
        sa.Column("recorded_at", sa.String(length=64), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_daily_records_child_id", "daily_records", ["child_id"])
    op.create_table(
        "risk_predictions",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("child_id", sa.String(length=128), nullable=False),
        sa.Column("prediction_at", sa.String(length=64), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_risk_predictions_child_id", "risk_predictions", ["child_id"])
    op.create_table(
        "dysregulation_events",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("child_id", sa.String(length=128), nullable=False),
        sa.Column("occurred_at", sa.String(length=64), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dysregulation_events_child_id", "dysregulation_events", ["child_id"])


def downgrade() -> None:
    op.drop_index("ix_dysregulation_events_child_id", table_name="dysregulation_events")
    op.drop_table("dysregulation_events")
    op.drop_index("ix_risk_predictions_child_id", table_name="risk_predictions")
    op.drop_table("risk_predictions")
    op.drop_index("ix_daily_records_child_id", table_name="daily_records")
    op.drop_table("daily_records")

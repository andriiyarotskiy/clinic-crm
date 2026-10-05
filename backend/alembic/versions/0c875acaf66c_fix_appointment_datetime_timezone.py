"""fix appointment datetime timezone

Revision ID: 0c875acaf66c
Revises: e7f0ca71e840
Create Date: 2026-10-05 18:49:05.042916

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0c875acaf66c"
down_revision: Union[str, Sequence[str], None] = "e7f0ca71e840"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert appointment date_time to timezone-aware timestamp."""

    op.alter_column(
        "appointments",
        "date_time",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="date_time AT TIME ZONE 'Europe/Kyiv'",
    )


def downgrade() -> None:
    """Convert appointment date_time back to Kyiv local naive timestamp."""

    op.alter_column(
        "appointments",
        "date_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=False,
        postgresql_using="date_time AT TIME ZONE 'Europe/Kyiv'",
    )

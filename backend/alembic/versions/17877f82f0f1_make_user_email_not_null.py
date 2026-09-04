"""make_user_email_not_null
Revision ID: 17877f82f0f1
Revises: 8d8f04bcb57a
Create Date: 2026-08-13 23:13:22.186459
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '17877f82f0f1'
down_revision: Union[str, Sequence[str], None] = '8d8f04bcb57a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('users', 'email',
               existing_type=sa.VARCHAR(length=50),
               nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'email',
               existing_type=sa.VARCHAR(length=50),
               nullable=True)

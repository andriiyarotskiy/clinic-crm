"""allow user role in users constraint

Revision ID: 35361d32b17b
Revises: e7f0ca71e840
Create Date: 2026-09-06 22:03:01.926335

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '35361d32b17b'
down_revision: Union[str, Sequence[str], None] = 'e7f0ca71e840'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Allow user role in users.role constraint."""
    op.drop_constraint(
        "users_role_check",
        "users",
        type_="check",
    )

    op.create_check_constraint(
        "users_role_check",
        "users",
        "role IN ('superadmin', 'admin', 'doctor', 'patient', 'user')",
    )


def downgrade() -> None:
    """Restore previous users.role constraint."""
    op.drop_constraint(
        "users_role_check",
        "users",
        type_="check",
    )

    op.create_check_constraint(
        "users_role_check",
        "users",
        "role IN ('superadmin', 'admin', 'doctor', 'patient')",
    )


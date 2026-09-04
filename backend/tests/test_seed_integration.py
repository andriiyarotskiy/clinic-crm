import os
import pytest
from pathlib import Path
import sys
import sqlalchemy as sa

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import scripts.seed_from_csv as seed_mod
from database import UserModel, SyncSessionLocal


@pytest.fixture
def db_available() -> None:
    try:
        with SyncSessionLocal() as session:
            session.execute(sa.text("SELECT 1"))
            session.commit()
    except Exception:
        pytest.skip(
            "PostgreSQL is not reachable. Start it with: docker compose -f docker-compose-dev.yml up -d db"
        )


@pytest.fixture
def cleanup_test_users():
    test_ids = (-999001, -999002)

    with SyncSessionLocal() as session:
        session.execute(sa.text("DELETE FROM users WHERE id = ANY(:ids)"), {"ids": list(test_ids)})
        session.commit()

    yield test_ids

    with SyncSessionLocal() as session:
        session.execute(sa.text("DELETE FROM users WHERE id = ANY(:ids)"), {"ids": list(test_ids)})
        session.commit()


@pytest.mark.integration
@pytest.mark.skipif(
    os.environ.get("RUN_INTEGRATION") != "1",
    reason="Integration tests disabled. Set RUN_INTEGRATION=1 to enable.",
)
def test_upsert_rows_updates_integration(db_available, cleanup_test_users):
    """Integration test for upsert_rows: requires a running Postgres instance reachable by project settings.

    Run separately with: `pytest -q -m integration` after starting the docker-compose DB.
    """
    test_ids = cleanup_test_users
    rows = [
        {"id": test_ids[0], "email": "intuser@example.test", "first_name": "Int", "last_name": "User", "role": "user"},
        {"id": test_ids[1], "email": "intuser2@example.test", "first_name": "Int2", "last_name": "User2", "role": "user"},
    ]

    with SyncSessionLocal() as session:
        count1 = seed_mod.upsert_rows(session, UserModel, rows)
        session.commit()

        rows[0]["first_name"] = "Updated"
        count2 = seed_mod.upsert_rows(session, UserModel, rows)
        session.commit()

        assert count1 == len(rows)
        assert count2 == len(rows)

        res = session.execute(sa.text("SELECT id, first_name FROM users WHERE id = :id"), {"id": test_ids[0]}).fetchone()
        assert res is not None
        assert res[1] == "Updated"

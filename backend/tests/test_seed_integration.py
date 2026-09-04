import os
import pytest
from pathlib import Path
import sys
import sqlalchemy as sa

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import scripts.seed_from_csv as seed_mod
from database import UserModel, SyncSessionLocal


@pytest.mark.integration
@pytest.mark.skipif(
    os.environ.get("RUN_INTEGRATION") != "1",
    reason="Integration tests disabled. Set RUN_INTEGRATION=1 to enable.",
)
def test_upsert_rows_updates_integration():
    """Integration test for upsert_rows: requires a running Postgres instance reachable by project settings.

    Run separately with: `pytest -q -m integration` after starting the docker-compose DB.
    """
    rows = [
        {"id": 10001, "email": "intuser@example.test", "first_name": "Int", "last_name": "User", "role": "user"},
        {"id": 10002, "email": "intuser2@example.test", "first_name": "Int2", "last_name": "User2", "role": "user"},
    ]

    with SyncSessionLocal() as session:
        # clean up any leftovers (best-effort)
        session.execute(sa.text("DELETE FROM users WHERE id IN (10001,10002)"))
        session.commit()

        # first upsert
        count1 = seed_mod.upsert_rows(session, UserModel, rows)
        session.commit()

        # change one row's first_name and upsert again
        rows[0]["first_name"] = "Updated"
        count2 = seed_mod.upsert_rows(session, UserModel, rows)
        session.commit()

        # ensure count of affected rows equals len(rows)
        assert count1 == len(rows)
        assert count2 == len(rows)

        # verify no duplicate and that update applied
        res = session.execute(sa.text("SELECT id, first_name FROM users WHERE id = 10001")).fetchone()
        assert res is not None
        assert res[1] == "Updated"

        # cleanup
        session.execute(sa.text("DELETE FROM users WHERE id IN (10001,10002)"))
        session.commit()

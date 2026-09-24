from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.seed_from_csv import coerce_csv_value, load_csv_rows
import scripts.seed_from_csv as seed_mod
import sys


class DummySettings:
    def __init__(self, host: str):
        self.POSTGRES_HOST = host


def test_coerce_csv_value_handles_empty_and_boolean_values() -> None:
    assert coerce_csv_value("", str) is None
    assert coerce_csv_value("true", bool) is True
    assert coerce_csv_value("false", bool) is False
    assert coerce_csv_value("  ", int) is None


def test_load_csv_rows_reads_seed_file(tmp_path: Path) -> None:
    csv_file = tmp_path / "users.csv"
    csv_file.write_text("id,role,first_name,last_name,email\n1,admin,Alice,Smith,alice@example.com\n", encoding="utf-8")

    rows = load_csv_rows(csv_file)

    assert rows == [
        {
            "id": 1,
            "role": "admin",
            "first_name": "Alice",
            "last_name": "Smith",
            "email": "alice@example.com",
        }
    ]


def test_is_local_host_accepts_known_local_values() -> None:
    assert seed_mod.is_local_host("localhost") is True
    assert seed_mod.is_local_host("127.0.0.1") is True
    assert seed_mod.is_local_host("0.0.0.0") is True
    assert seed_mod.is_local_host("db") is True
    assert seed_mod.is_local_host("postgres") is True
    assert seed_mod.is_local_host("http://db:5432") is True
    assert seed_mod.is_local_host("aws-rds-instance.amazonaws.com") is False
    assert seed_mod.is_local_host("xxx.supabase.co") is False


def test_remote_host_blocked_by_default(monkeypatch, tmp_path: Path) -> None:
    # Simulate a non-local DB host; seed script should refuse to run unless --allow-remote
    monkeypatch.setattr(seed_mod, "get_settings", lambda: DummySettings("aws-rds-instance.amazonaws.com"))
    monkeypatch.setattr(sys, "argv", ["seed_from_csv.py", "--csv-dir", str(tmp_path), "--dry-run"])

    try:
        seed_mod.main()
        raised = False
    except RuntimeError as exc:
        raised = True
        assert "local allowlist" in str(exc)

    assert raised


def test_remote_host_allowed_when_explicitly_opted_in(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setattr(seed_mod, "get_settings", lambda: DummySettings("aws-rds-instance.amazonaws.com"))
    monkeypatch.setattr(sys, "argv", ["seed_from_csv.py", "--csv-dir", str(tmp_path), "--dry-run", "--allow-remote"])

    for _, basename in seed_mod.CSV_FILE_ORDER:
        (tmp_path / basename).write_text("id\n1\n", encoding="utf-8")

    assert seed_mod.main() == 0

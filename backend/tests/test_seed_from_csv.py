from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.seed_from_csv import coerce_csv_value, load_csv_rows


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

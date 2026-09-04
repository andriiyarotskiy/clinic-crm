from __future__ import annotations

import argparse
import csv
import logging
import os
import sys
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert as pg_insert

BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
os.chdir(BASE_DIR)

from config import get_settings  # noqa: E402
from database import (  # noqa: E402
    AppointmentModel,
    AppointmentStatusEnum,
    DoctorModel,
    PatientModel,
    SyncSessionLocal,
    TreatmentModel,
    UserModel,
    UserRoleEnum,
    VisitModel,
)

logger = logging.getLogger("clinic_seed")

DEFAULT_CSV_DIR = BASE_DIR / "seed_data"
CSV_FILE_ORDER = [
    ("users", "users.csv"),
    ("patients", "patients.csv"),
    ("doctors", "doctors.csv"),
    ("treatments", "treatments.csv"),
    ("appointments", "appointments.csv"),
    ("visit", "visit.csv"),
]


def coerce_csv_value(raw_value: str | None, expected_type: type | tuple[type, ...] | None = None) -> Any:
    if raw_value is None:
        return None

    value = raw_value.strip()
    if value == "" or value.lower() in {"null", "none", "nan", "n/a"}:
        return None

    if expected_type is None:
        return value

    if expected_type is bool:
        return value.lower() in {"true", "1", "yes", "y", "t"}

    if expected_type is int:
        return int(value)

    if expected_type is Decimal:
        return Decimal(value)

    if expected_type is float:
        return float(value)

    if expected_type is datetime:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed

    if expected_type is date:
        return date.fromisoformat(value)

    return value


def coerce_row_values(row: dict[str, str]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for key, raw_value in row.items():
        field_name = (key or "").strip()
        if not field_name:
            continue

        if field_name in {"id", "user_id", "patient_id", "doctor_id", "treatment_id", "treatment_add1", "treatment_add2", "duration", "years_experience"}:
            normalized[field_name] = coerce_csv_value(raw_value, int)
        elif field_name in {"is_active", "is_main"}:
            normalized[field_name] = coerce_csv_value(raw_value, bool)
        elif field_name in {"price", "amount"}:
            normalized[field_name] = coerce_csv_value(raw_value, Decimal)
        elif field_name in {"registration_date", "created_at", "date_time"}:
            normalized[field_name] = coerce_csv_value(raw_value, datetime)
        elif field_name == "date_of_birth":
            normalized[field_name] = coerce_csv_value(raw_value, date)
        else:
            normalized[field_name] = coerce_csv_value(raw_value, str)
    return normalized


def load_csv_rows(csv_path: Path) -> list[dict[str, Any]]:
    with csv_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError(f"CSV file {csv_path} does not contain a header row.")
        return [coerce_row_values(row) for row in reader]


def upsert_rows(session: Any, model: type[Any], rows: list[dict[str, Any]]) -> int:
    if not rows:
        return 0

    table = model.__table__
    primary_key = next(iter(table.primary_key.columns))
    set_columns = {
        column.name: sa.text(f"EXCLUDED.{column.name}")
        for column in table.columns
        if column.name != primary_key.name
    }

    stmt = pg_insert(table).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=[primary_key],
        set_=set_columns,
    )
    session.execute(stmt)
    session.flush()
    return len(rows)


def build_user_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        item["role"] = UserRoleEnum(item["role"]).value if item.get("role") else None
        item["registration_date"] = item.get("registration_date")
        item["is_active"] = bool(item.get("is_active")) if item.get("is_active") is not None else False
        prepared.append(item)
    return prepared


def build_patient_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        if item.get("gender") in {None, "", "child"}:
            item["gender"] = None
        prepared.append(item)
    return prepared


def build_doctor_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def build_treatment_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        item["is_main"] = bool(item.get("is_main")) if item.get("is_main") is not None else False
        prepared.append(item)
    return prepared


def build_appointment_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        if item.get("status"):
            item["status"] = AppointmentStatusEnum(item["status"]).value
        if item.get("notes") in {None, ""}:
            item["notes"] = None
        prepared.append(item)
    return prepared


def build_visit_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        for field_name in ("treatment_add1", "treatment_add2"):
            if item.get(field_name) in {None, ""}:
                item[field_name] = None
        prepared.append(item)
    return prepared


def truncate_tables(session: Any) -> None:
    session.execute(
        sa.text(
            """
            TRUNCATE TABLE visit, appointments, doctors, patients, users, treatments
            RESTART IDENTITY CASCADE;
            """
        )
    )
    session.commit()


def import_table(session: Any, table_name: str, rows: list[dict[str, Any]]) -> int:
    mapping = {
        "users": (UserModel, build_user_rows),
        "patients": (PatientModel, build_patient_rows),
        "doctors": (DoctorModel, build_doctor_rows),
        "treatments": (TreatmentModel, build_treatment_rows),
        "appointments": (AppointmentModel, build_appointment_rows),
        "visit": (VisitModel, build_visit_rows),
    }
    model, builder = mapping[table_name]
    prepared = builder(rows)
    imported_count = upsert_rows(session, model, prepared)
    logger.info("%s: %d rows processed", table_name, imported_count)
    return imported_count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed the Clinic CRM database with CSV fixtures.")
    parser.add_argument(
        "--csv-dir",
        type=Path,
        default=DEFAULT_CSV_DIR,
        help="Directory with the CSV files. Default: backend/seed_data",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate CSVs and print counts without writing to the database.",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Delete existing table data before seeding. Requires confirmation.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Skip the confirmation prompt for --truncate.",
    )
    return parser.parse_args()


def confirm_truncate(force: bool) -> None:
    if force:
        return
    response = input(
        "WARNING: this will permanently delete all data from users, patients, doctors, appointments, visit, and treatments. Type 'DELETE ALL DATA' to continue: "
    ).strip()
    if response != "DELETE ALL DATA":
        raise SystemExit("Seed aborted: truncate confirmation was not provided.")


def main() -> int:
    args = parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    csv_dir = args.csv_dir.resolve()
    if not csv_dir.exists():
        raise FileNotFoundError(f"CSV directory not found: {csv_dir}")

    if args.truncate and not args.dry_run:
        logger.warning(
            "This will clear existing data in the seed tables before loading the CSV fixtures."
        )
        confirm_truncate(args.force)

    loaded_counts: dict[str, int] = {}
    with SyncSessionLocal() as session:
        for table_name, csv_name in CSV_FILE_ORDER:
            csv_path = csv_dir / csv_name
            if not csv_path.exists():
                raise FileNotFoundError(f"Missing seed file: {csv_path}")

            rows = load_csv_rows(csv_path)
            loaded_counts[table_name] = len(rows)
            logger.info("Loaded %d rows from %s", len(rows), csv_path.name)

            if args.dry_run:
                continue

            if args.truncate:
                truncate_tables(session)
                args.truncate = False

            imported_count = import_table(session, table_name, rows)
            loaded_counts[table_name] = imported_count
            session.commit()

    logger.info("Seeding summary:")
    for table_name, count in loaded_counts.items():
        logger.info("- %s: %d rows", table_name, count)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

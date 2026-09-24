from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from database.models.appointments import (
    AppointmentModel,
    AppointmentStatusEnum,
)
from database.models.doctors import DoctorModel
from database.models.patient import PatientModel
from database.models.treatments import TreatmentModel
from database.models.users import UserModel
from schemas.appointments import (
    AppointmentCreate,
    AppointmentUpdate,
)


ACTIVE_APPOINTMENT_STATUSES = (
    AppointmentStatusEnum.SCHEDULED,
    AppointmentStatusEnum.CONFIRMED,
)

CLINIC_TIMEZONE = ZoneInfo("Europe/Kyiv")


class AppointmentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    @staticmethod
    def _apply_filters(
        statement,
        doctor_id: int | None = None,
        patient_id: int | None = None,
        appointment_date: date | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        appointment_status: AppointmentStatusEnum | None = None,
    ):
        if doctor_id is not None:
            statement = statement.where(
                AppointmentModel.doctor_id == doctor_id,
            )

        if patient_id is not None:
            statement = statement.where(
                AppointmentModel.patient_id == patient_id,
            )

        if appointment_date is not None:
            day_start = datetime.combine(
                appointment_date,
                time.min,
                tzinfo=CLINIC_TIMEZONE,
            ).astimezone(timezone.utc)

            day_end = datetime.combine(
                appointment_date + timedelta(days=1),
                time.min,
                tzinfo=CLINIC_TIMEZONE,
            ).astimezone(timezone.utc)

            statement = statement.where(
                AppointmentModel.date_time >= day_start,
                AppointmentModel.date_time < day_end,
            )

        if date_from is not None:
            start_datetime = datetime.combine(
                date_from,
                time.min,
                tzinfo=CLINIC_TIMEZONE,
            ).astimezone(timezone.utc)

            statement = statement.where(
                AppointmentModel.date_time >= start_datetime,
            )

        if date_to is not None:
            end_datetime = datetime.combine(
                date_to + timedelta(days=1),
                time.min,
                tzinfo=CLINIC_TIMEZONE,
            ).astimezone(timezone.utc)

            statement = statement.where(
                AppointmentModel.date_time < end_datetime,
            )

        if appointment_status is not None:
            statement = statement.where(
                AppointmentModel.status == appointment_status,
            )

        return statement

    @staticmethod
    def _serialize_appointment(
        appointment: AppointmentModel,
        patient_first_name: str | None,
        patient_last_name: str | None,
        patient_phone_number: str | None,
        doctor_first_name: str | None,
        doctor_last_name: str | None,
        treatment_name: str | None,
        treatment_price: Decimal | None,
    ) -> dict[str, Any]:
        return {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "treatment_id": appointment.treatment_id,
            "date_time": appointment.date_time.astimezone(
                CLINIC_TIMEZONE,
            ),
            "duration": appointment.duration,
            "status": appointment.status,
            "notes": appointment.notes,
            "created_at": appointment.created_at,
            "patient_first_name": patient_first_name,
            "patient_last_name": patient_last_name,
            "patient_phone_number": patient_phone_number,
            "doctor_first_name": doctor_first_name,
            "doctor_last_name": doctor_last_name,
            "treatment": treatment_name,
            "treatment_price": (
                float(treatment_price) if treatment_price is not None else None
            ),
        }

    def add(
        self,
        appointment_data: AppointmentCreate,
        date_time: datetime,
        duration: int,
    ) -> AppointmentModel:
        appointment = AppointmentModel(
            patient_id=appointment_data.patient_id,
            doctor_id=appointment_data.doctor_id,
            treatment_id=appointment_data.treatment_id,
            date_time=date_time,
            duration=duration,
            notes=appointment_data.notes,
            status=AppointmentStatusEnum.SCHEDULED,
        )

        self.session.add(appointment)

        return appointment

    async def get_by_id(
        self,
        appointment_id: int,
    ) -> AppointmentModel | None:
        statement = select(AppointmentModel).where(
            AppointmentModel.id == appointment_id,
        )

        result = await self.session.execute(statement)

        return result.scalar_one_or_none()

    async def is_doctor_busy(
        self,
        doctor_id: int,
        date_time: datetime,
        duration: int,
        exclude_appointment_id: int | None = None,
    ) -> bool:
        new_appointment_end = date_time + timedelta(minutes=duration)

        statement = select(AppointmentModel).where(
            AppointmentModel.doctor_id == doctor_id,
            AppointmentModel.status.in_(
                ACTIVE_APPOINTMENT_STATUSES,
            ),
        )

        if exclude_appointment_id is not None:
            statement = statement.where(
                AppointmentModel.id != exclude_appointment_id,
            )

        result = await self.session.execute(statement)

        appointments = result.scalars().all()

        for appointment in appointments:
            appointment_start = appointment.date_time
            appointment_end = appointment_start + timedelta(
                minutes=appointment.duration
            )

            has_overlap = (
                date_time < appointment_end and new_appointment_end > appointment_start
            )

            if has_overlap:
                return True

        return False

    async def is_patient_busy(
            self,
            patient_id: int,
            date_time: datetime,
            duration: int,
            exclude_appointment_id: int | None = None,
    ) -> bool:
        new_appointment_end = date_time + timedelta(minutes=duration)

        statement = select(AppointmentModel).where(
            AppointmentModel.patient_id == patient_id,
            AppointmentModel.status.in_(
                ACTIVE_APPOINTMENT_STATUSES,
            ),
        )

        if exclude_appointment_id is not None:
            statement = statement.where(
                AppointmentModel.id != exclude_appointment_id,
            )

        result = await self.session.execute(statement)

        appointments = result.scalars().all()

        for appointment in appointments:
            appointment_start = appointment.date_time
            appointment_end = appointment_start + timedelta(
                minutes=appointment.duration
            )

            has_overlap = (
                    date_time < appointment_end
                    and new_appointment_end > appointment_start
            )

            if has_overlap:
                return True

        return False

    async def get_details_by_id(
        self,
        appointment_id: int,
    ) -> dict[str, Any] | None:
        patient_user = aliased(UserModel)
        doctor_user = aliased(UserModel)

        statement = (
            select(
                AppointmentModel,
                patient_user.first_name,
                patient_user.last_name,
                patient_user.phone_number,
                doctor_user.first_name,
                doctor_user.last_name,
                TreatmentModel.treatment,
                TreatmentModel.price,
            )
            .join(
                PatientModel,
                AppointmentModel.patient_id == PatientModel.id,
            )
            .join(
                patient_user,
                PatientModel.user_id == patient_user.id,
            )
            .join(
                DoctorModel,
                AppointmentModel.doctor_id == DoctorModel.id,
            )
            .join(
                doctor_user,
                DoctorModel.user_id == doctor_user.id,
            )
            .join(
                TreatmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .where(
                AppointmentModel.id == appointment_id,
            )
        )

        result = await self.session.execute(statement)
        row = result.one_or_none()

        if row is None:
            return None

        return self._serialize_appointment(
            appointment=row[0],
            patient_first_name=row[1],
            patient_last_name=row[2],
            patient_phone_number=row[3],
            doctor_first_name=row[4],
            doctor_last_name=row[5],
            treatment_name=row[6],
            treatment_price=row[7],
        )

    async def get_all(
        self,
        doctor_id: int | None = None,
        patient_id: int | None = None,
        search: str | None = None,
        appointment_date: date | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        appointment_status: AppointmentStatusEnum | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        patient_user = aliased(UserModel)
        doctor_user = aliased(UserModel)

        statement = (
            select(
                AppointmentModel,
                patient_user.first_name,
                patient_user.last_name,
                patient_user.phone_number,
                doctor_user.first_name,
                doctor_user.last_name,
                TreatmentModel.treatment,
                TreatmentModel.price,
            )
            .join(
                PatientModel,
                AppointmentModel.patient_id == PatientModel.id,
            )
            .join(
                patient_user,
                PatientModel.user_id == patient_user.id,
            )
            .join(
                DoctorModel,
                AppointmentModel.doctor_id == DoctorModel.id,
            )
            .join(
                doctor_user,
                DoctorModel.user_id == doctor_user.id,
            )
            .join(
                TreatmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
        )

        statement = self._apply_filters(
            statement=statement,
            doctor_id=doctor_id,
            patient_id=patient_id,
            appointment_date=appointment_date,
            date_from=date_from,
            date_to=date_to,
            appointment_status=appointment_status,
        )

        if search:
            search_value = f"%{search.strip()}%"

            statement = statement.where(
                or_(
                    patient_user.first_name.ilike(search_value),
                    patient_user.last_name.ilike(search_value),
                )
            )

        statement = (
            statement.order_by(
                AppointmentModel.date_time,
                AppointmentModel.id,
            )
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(statement)

        appointments: list[dict[str, Any]] = []

        for row in result.all():
            appointments.append(
                self._serialize_appointment(
                    appointment=row[0],
                    patient_first_name=row[1],
                    patient_last_name=row[2],
                    patient_phone_number=row[3],
                    doctor_first_name=row[4],
                    doctor_last_name=row[5],
                    treatment_name=row[6],
                    treatment_price=row[7],
                )
            )

        return appointments

    async def get_total(
        self,
        doctor_id: int | None = None,
        patient_id: int | None = None,
        search: str | None = None,
        appointment_date: date | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        appointment_status: AppointmentStatusEnum | None = None,
    ) -> int:
        patient_user = aliased(UserModel)

        statement = (
            select(func.count(AppointmentModel.id))
            .join(
                PatientModel,
                AppointmentModel.patient_id == PatientModel.id,
            )
            .join(
                patient_user,
                PatientModel.user_id == patient_user.id,
            )
        )

        statement = self._apply_filters(
            statement=statement,
            doctor_id=doctor_id,
            patient_id=patient_id,
            appointment_date=appointment_date,
            date_from=date_from,
            date_to=date_to,
            appointment_status=appointment_status,
        )

        if search:
            search_value = f"%{search.strip()}%"

            statement = statement.where(
                or_(
                    patient_user.first_name.ilike(search_value),
                    patient_user.last_name.ilike(search_value),
                )
            )

        result = await self.session.scalar(statement)

        return int(result or 0)

    def update(
        self,
        appointment: AppointmentModel,
        appointment_data: AppointmentUpdate,
        date_time: datetime | None = None,
    ) -> AppointmentModel:
        update_data = appointment_data.model_dump(
            exclude_unset=True,
        )

        update_data.pop("appointment_date", None)
        update_data.pop("appointment_time", None)

        for field, value in update_data.items():
            setattr(
                appointment,
                field,
                value,
            )

        if date_time is not None:
            appointment.date_time = date_time

        return appointment

    async def delete(
        self,
        appointment: AppointmentModel,
    ) -> None:
        await self.session.delete(appointment)

    async def get_doctor_appointments_by_date(
        self,
        doctor_id: int,
        selected_date: date,
    ) -> list[AppointmentModel]:
        day_start = datetime.combine(
            selected_date,
            time.min,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        day_end = datetime.combine(
            selected_date + timedelta(days=1),
            time.min,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        statement = (
            select(AppointmentModel)
            .where(
                AppointmentModel.doctor_id == doctor_id,
                AppointmentModel.date_time >= day_start,
                AppointmentModel.date_time < day_end,
                AppointmentModel.status.in_(
                    ACTIVE_APPOINTMENT_STATUSES,
                ),
            )
            .order_by(
                AppointmentModel.date_time,
                AppointmentModel.id,
            )
        )

        result = await self.session.execute(statement)

        return list(result.scalars().all())

    async def get_for_month(
        self,
        year: int,
        month: int,
    ) -> list[AppointmentModel]:
        month_start = datetime(
            year=year,
            month=month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        if month == 12:
            next_month_start = datetime(
                year=year + 1,
                month=1,
                day=1,
                tzinfo=CLINIC_TIMEZONE,
            ).astimezone(timezone.utc)
        else:
            next_month_start = datetime(
                year=year,
                month=month + 1,
                day=1,
                tzinfo=CLINIC_TIMEZONE,
            ).astimezone(timezone.utc)

        statement = (
            select(AppointmentModel)
            .where(
                AppointmentModel.date_time >= month_start,
                AppointmentModel.date_time < next_month_start,
            )
            .order_by(
                AppointmentModel.date_time,
                AppointmentModel.id,
            )
        )

        result = await self.session.scalars(statement)

        return list(result.all())

    async def get_dashboard_statistics(
        self,
        now: datetime,
    ) -> dict[str, int]:
        local_now = now.astimezone(
            CLINIC_TIMEZONE,
        )

        today_start = datetime.combine(
            local_now.date(),
            time.min,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        tomorrow_start = datetime.combine(
            local_now.date() + timedelta(days=1),
            time.min,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        statement = select(
            func.count(AppointmentModel.id)
            .filter(
                AppointmentModel.date_time >= today_start,
                AppointmentModel.date_time < tomorrow_start,
            )
            .label("today_appointments"),
            func.count(AppointmentModel.id)
            .filter(
                AppointmentModel.date_time > now,
                AppointmentModel.status.in_(
                    ACTIVE_APPOINTMENT_STATUSES,
                ),
            )
            .label("upcoming_appointments"),
            func.count(AppointmentModel.id)
            .filter(
                AppointmentModel.date_time >= today_start,
                AppointmentModel.date_time < tomorrow_start,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .label("completed_today"),
            func.count(AppointmentModel.id)
            .filter(
                AppointmentModel.date_time >= today_start,
                AppointmentModel.date_time < tomorrow_start,
                AppointmentModel.status == AppointmentStatusEnum.CANCELLED,
            )
            .label("cancelled_today"),
        )

        result = await self.session.execute(statement)
        row = result.one()

        return {
            "today_appointments": int(row.today_appointments or 0),
            "upcoming_appointments": int(row.upcoming_appointments or 0),
            "completed_today": int(row.completed_today or 0),
            "cancelled_today": int(row.cancelled_today or 0),
        }

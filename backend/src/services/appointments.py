from calendar import monthrange
from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from math import ceil
from typing import Any
from zoneinfo import ZoneInfo
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.appointments import (
    AppointmentModel,
    AppointmentStatusEnum,
)
from repositories.appointments import AppointmentRepository
from repositories.doctors import DoctorRepository
from repositories.patients import PatientRepository
from repositories.treatments import TreatmentRepository
from schemas.appointments import (
    AppointmentCalendarResponse,
    AppointmentCreate,
    AppointmentDashboardResponse,
    AppointmentStatisticsResponse,
    AppointmentUpdate,
    AvailableSlotResponse,
    AvailableSlotsResponse,
)


CLINIC_TIMEZONE = ZoneInfo("Europe/Kyiv")
WORKDAY_START = time(hour=8, minute=0)
WORKDAY_END = time(hour=21, minute=0)

SLOT_STEP_MINUTES = 30
DASHBOARD_SLOT_DURATION_MINUTES = 30

DASHBOARD_BLOCKING_STATUSES = (
    AppointmentStatusEnum.SCHEDULED,
    AppointmentStatusEnum.CONFIRMED,
)


class AppointmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

        self.appointments = AppointmentRepository(session)
        self.patients = PatientRepository(session)
        self.doctors = DoctorRepository(session)
        self.treatments = TreatmentRepository(session)

    async def create(
        self,
        appointment_data: AppointmentCreate,
    ) -> dict[str, Any]:
        patient = await self.patients.get_by_id(
            appointment_data.patient_id,
        )

        if patient is None:
            raise ValueError("Patient not found.")

        doctor = await self.doctors.get_by_id(
            appointment_data.doctor_id,
        )

        if doctor is None:
            raise ValueError("Doctor not found.")

        await self._get_main_treatment(
            appointment_data.treatment_id,
        )

        local_date_time = datetime.combine(
            appointment_data.appointment_date,
            appointment_data.appointment_time,
            tzinfo=CLINIC_TIMEZONE,
        )

        appointment_date_time = local_date_time.astimezone(
            timezone.utc,
        )

        if appointment_date_time <= datetime.now(timezone.utc):
            raise ValueError("Appointment date and time must be in the future.")

        doctor_busy = await self.appointments.is_doctor_busy(
            doctor_id=appointment_data.doctor_id,
            date_time=appointment_date_time,
            duration=appointment_data.duration,
        )

        if doctor_busy:
            raise ValueError("Doctor already has an appointment during this time.")

        patient_busy = await self.appointments.is_patient_busy(
            patient_id=appointment_data.patient_id,
            date_time=appointment_date_time,
            duration=appointment_data.duration,
        )

        if patient_busy:
            raise ValueError(
                "Patient already has an appointment during this time."
            )

        try:
            appointment = self.appointments.add(
                appointment_data=appointment_data,
                date_time=appointment_date_time,
                duration=appointment_data.duration,
            )

            await self.session.commit()
            await self.session.refresh(appointment)

        except SQLAlchemyError:
            await self.session.rollback()
            raise

        appointment_details = await self.appointments.get_details_by_id(
            appointment.id,
        )

        if appointment_details is None:
            raise ValueError("Appointment was not created.")

        return appointment_details

    async def get_all(
        self,
        doctor_id: int | None = None,
        patient_id: int | None = None,
        search: str | None = None,
        appointment_date: date | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        appointment_status: AppointmentStatusEnum | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        if date_from is not None and date_to is not None and date_from > date_to:
            raise ValueError("date_from cannot be later than date_to.")

        if appointment_date is not None and (
            date_from is not None or date_to is not None
        ):
            raise ValueError(
                "Use either appointment_date or date_from/date_to, not both."
            )

        offset = (page - 1) * page_size

        total = await self.appointments.get_total(
            doctor_id=doctor_id,
            patient_id=patient_id,
            search=search,
            appointment_date=appointment_date,
            date_from=date_from,
            date_to=date_to,
            appointment_status=appointment_status,
        )

        items = await self.appointments.get_all(
            doctor_id=doctor_id,
            patient_id=patient_id,
            search=search,
            appointment_date=appointment_date,
            date_from=date_from,
            date_to=date_to,
            appointment_status=appointment_status,
            limit=page_size,
            offset=offset,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": ceil(total / page_size) if total else 0,
        }

    async def get_by_id(
        self,
        appointment_id: int,
    ) -> dict[str, Any]:
        appointment = await self.appointments.get_details_by_id(
            appointment_id=appointment_id,
        )

        if appointment is None:
            raise ValueError("Appointment not found.")

        return appointment

    async def _get_model_by_id(
        self,
        appointment_id: int,
    ) -> AppointmentModel:
        appointment = await self.appointments.get_by_id(
            appointment_id=appointment_id,
        )

        if appointment is None:
            raise ValueError("Appointment not found.")

        return appointment

    async def _get_details_after_change(
        self,
        appointment_id: int,
    ) -> dict[str, Any]:
        appointment_details = await self.appointments.get_details_by_id(
            appointment_id,
        )

        if appointment_details is None:
            raise ValueError("Appointment not found.")

        return appointment_details

    async def _get_main_treatment(
        self,
        treatment_id: int,
    ):
        treatment = await self.treatments.get_by_id(
            treatment_id,
        )

        if treatment is None:
            raise ValueError("Treatment not found.")

        if not treatment.is_main:
            raise ValueError(
                "Only a main treatment can be selected for an appointment."
            )

        return treatment

    @staticmethod
    def _validate_status_transition(
        current_status: AppointmentStatusEnum,
        new_status: AppointmentStatusEnum,
        appointment_date_time: datetime,
        now: datetime,
    ) -> None:
        if new_status == current_status:
            return

        allowed_transitions = {
            AppointmentStatusEnum.SCHEDULED: {
                AppointmentStatusEnum.CONFIRMED,
                AppointmentStatusEnum.CANCELLED,
                AppointmentStatusEnum.COMPLETED,
                AppointmentStatusEnum.NO_SHOW,
            },
            AppointmentStatusEnum.CONFIRMED: {
                AppointmentStatusEnum.CANCELLED,
                AppointmentStatusEnum.COMPLETED,
                AppointmentStatusEnum.NO_SHOW,
            },
        }

        allowed_statuses = allowed_transitions.get(
            current_status,
            set(),
        )

        if new_status not in allowed_statuses:
            raise ValueError(
                f"Appointment status cannot be changed from "
                f"'{current_status.value}' to '{new_status.value}'."
            )

        if (
            new_status == AppointmentStatusEnum.CONFIRMED
            and appointment_date_time <= now
        ):
            raise ValueError("Past appointment cannot be confirmed.")

        if (
            new_status == AppointmentStatusEnum.CANCELLED
            and appointment_date_time <= now
        ):
            raise ValueError("A past appointment cannot be cancelled.")

        if (
            new_status == AppointmentStatusEnum.COMPLETED
            and appointment_date_time > now
        ):
            raise ValueError("A future appointment cannot be completed.")

        if new_status == AppointmentStatusEnum.NO_SHOW and appointment_date_time > now:
            raise ValueError("A future appointment cannot be marked as no-show.")

    async def update(
        self,
        appointment_id: int,
        appointment_data: AppointmentUpdate,
    ) -> dict[str, Any]:
        appointment = await self._get_model_by_id(
            appointment_id,
        )

        if appointment.status in {
            AppointmentStatusEnum.CANCELLED,
            AppointmentStatusEnum.COMPLETED,
            AppointmentStatusEnum.NO_SHOW,
        }:
            raise ValueError(
                "Cancelled, completed or no-show appointment cannot be updated."
            )

        update_data = appointment_data.model_dump(
            exclude_unset=True,
        )

        if not update_data:
            return await self._get_details_after_change(
                appointment.id,
            )

        required_fields = {
            "patient_id",
            "doctor_id",
            "treatment_id",
            "appointment_date",
            "appointment_time",
            "duration",
            "status",
        }

        for field_name in required_fields:
            if field_name in update_data and update_data[field_name] is None:
                raise ValueError(f"{field_name} cannot be null.")

        new_patient_id = update_data.get(
            "patient_id",
            appointment.patient_id,
        )

        new_doctor_id = update_data.get(
            "doctor_id",
            appointment.doctor_id,
        )

        new_treatment_id = update_data.get(
            "treatment_id",
            appointment.treatment_id,
        )

        current_local_date_time = appointment.date_time.astimezone(
            CLINIC_TIMEZONE,
        )
        new_date = update_data.get(
            "appointment_date",
            current_local_date_time.date(),
        )

        new_time = update_data.get(
            "appointment_time",
            current_local_date_time.time().replace(tzinfo=None),
        )

        date_time_changed = (
            "appointment_date" in update_data or "appointment_time" in update_data
        )

        if date_time_changed:
            local_date_time = datetime.combine(
                new_date,
                new_time,
                tzinfo=CLINIC_TIMEZONE,
            )

            new_date_time = local_date_time.astimezone(
                timezone.utc,
            )
        else:
            new_date_time = appointment.date_time

        new_duration = update_data.get(
            "duration",
            appointment.duration,
        )

        new_status = update_data.get(
            "status",
            appointment.status,
        )

        now = datetime.now(timezone.utc)

        self._validate_status_transition(
            current_status=appointment.status,
            new_status=new_status,
            appointment_date_time=new_date_time,
            now=now,
        )

        schedule_fields = {
            "patient_id",
            "doctor_id",
            "treatment_id",
            "appointment_date",
            "appointment_time",
            "duration",
        }

        schedule_changed = bool(schedule_fields.intersection(update_data))

        if schedule_changed and new_date_time <= now:
            raise ValueError("Past appointment scheduling data cannot be updated.")

        if schedule_changed:
            patient = await self.patients.get_by_id(
                new_patient_id,
            )

            if patient is None:
                raise ValueError("Patient not found.")

            doctor = await self.doctors.get_by_id(
                new_doctor_id,
            )

            if doctor is None:
                raise ValueError("Doctor not found.")

            await self._get_main_treatment(
                new_treatment_id,
            )

            if new_status in DASHBOARD_BLOCKING_STATUSES:
                doctor_busy = await self.appointments.is_doctor_busy(
                    doctor_id=new_doctor_id,
                    date_time=new_date_time,
                    duration=new_duration,
                    exclude_appointment_id=appointment.id,
                )

                if doctor_busy:
                    raise ValueError(
                        "Doctor already has an appointment during this time."
                    )

                patient_busy = await self.appointments.is_patient_busy(
                    patient_id=new_patient_id,
                    date_time=new_date_time,
                    duration=new_duration,
                    exclude_appointment_id=appointment.id,
                )

                if patient_busy:
                    raise ValueError(
                        "Patient already has an appointment during this time."
                    )

        try:
            self.appointments.update(
                appointment=appointment,
                appointment_data=appointment_data,
                date_time=new_date_time if date_time_changed else None,
            )

            await self.session.commit()
            await self.session.refresh(appointment)

        except SQLAlchemyError:
            await self.session.rollback()
            raise

        return await self._get_details_after_change(
            appointment.id,
        )

    async def get_dashboard(
        self,
        year: int,
        month: int,
    ) -> AppointmentDashboardResponse:
        if month < 1 or month > 12:
            raise ValueError("Month must be between 1 and 12.")

        days_in_month = monthrange(
            year,
            month,
        )[1]

        doctor_ids = await self.doctors.get_active_ids()

        month_appointments = await self.appointments.get_for_month(
            year=year,
            month=month,
        )

        appointments_by_doctor_and_date: dict[
            tuple[int, date],
            list[AppointmentModel],
        ] = defaultdict(list)

        for appointment in month_appointments:
            appointment_date = appointment.date_time.astimezone(CLINIC_TIMEZONE).date()

            appointments_by_doctor_and_date[
                (
                    appointment.doctor_id,
                    appointment_date,
                )
            ].append(appointment)

        available_days: list[int] = []
        fully_booked_days: list[int] = []

        today = datetime.now(CLINIC_TIMEZONE).date()

        if doctor_ids:
            for day_number in range(
                1,
                days_in_month + 1,
            ):
                selected_date = date(
                    year,
                    month,
                    day_number,
                )

                if selected_date < today:
                    continue

                if selected_date.weekday() >= 5:
                    continue

                day_has_free_slot = False

                for doctor_id in doctor_ids:
                    doctor_appointments = appointments_by_doctor_and_date.get(
                        (
                            doctor_id,
                            selected_date,
                        ),
                        [],
                    )

                    doctor_has_free_slot = self._doctor_has_free_slot(
                        selected_date=selected_date,
                        appointments=doctor_appointments,
                    )

                    if doctor_has_free_slot:
                        day_has_free_slot = True
                        break

                if day_has_free_slot:
                    available_days.append(day_number)
                else:
                    fully_booked_days.append(day_number)

        now = datetime.now(timezone.utc)

        statistics = await self.appointments.get_dashboard_statistics(
            now=now,
        )

        return AppointmentDashboardResponse(
            calendar=AppointmentCalendarResponse(
                year=year,
                month=month,
                days_in_month=days_in_month,
                available_days=available_days,
                fully_booked_days=fully_booked_days,
            ),
            statistics=AppointmentStatisticsResponse(
                today_appointments=statistics["today_appointments"],
                upcoming_appointments=statistics["upcoming_appointments"],
                completed_today=statistics["completed_today"],
                cancelled_today=statistics["cancelled_today"],
            ),
        )

    @staticmethod
    def _doctor_has_free_slot(
        selected_date: date,
        appointments: list[AppointmentModel],
    ) -> bool:
        workday_start = datetime.combine(
            selected_date,
            WORKDAY_START,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        workday_end = datetime.combine(
            selected_date,
            WORKDAY_END,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        slot_step = timedelta(
            minutes=SLOT_STEP_MINUTES,
        )

        slot_duration = timedelta(
            minutes=DASHBOARD_SLOT_DURATION_MINUTES,
        )

        current_slot_start = workday_start

        while current_slot_start + slot_duration <= workday_end:
            current_slot_end = current_slot_start + slot_duration

            slot_is_booked = False

            for appointment in appointments:
                if appointment.status not in DASHBOARD_BLOCKING_STATUSES:
                    continue

                appointment_start = appointment.date_time

                appointment_end = appointment_start + timedelta(
                    minutes=appointment.duration
                )

                has_overlap = (
                    current_slot_start < appointment_end
                    and current_slot_end > appointment_start
                )

                if has_overlap:
                    slot_is_booked = True
                    break

            if not slot_is_booked:
                return True

            current_slot_start += slot_step

        return False

    async def get_available_slots(
        self,
        selected_date: date,
        doctor_id: int,
        duration: int,
    ) -> AvailableSlotsResponse:
        doctor = await self.doctors.get_by_id(
            doctor_id,
        )

        if doctor is None:
            raise ValueError("Doctor not found.")

        if duration < 30:
            raise ValueError("Appointment duration must be at least 30 minutes.")

        if duration > 180:
            raise ValueError("Appointment duration cannot exceed 180 minutes.")

        appointments = await self.appointments.get_doctor_appointments_by_date(
            doctor_id=doctor_id,
            selected_date=selected_date,
        )

        workday_start = datetime.combine(
            selected_date,
            WORKDAY_START,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        workday_end = datetime.combine(
            selected_date,
            WORKDAY_END,
            tzinfo=CLINIC_TIMEZONE,
        ).astimezone(timezone.utc)

        now = datetime.now(timezone.utc)

        slot_step = timedelta(
            minutes=SLOT_STEP_MINUTES,
        )

        requested_duration = timedelta(
            minutes=duration,
        )

        slots: list[AvailableSlotResponse] = []

        current_slot_start = workday_start

        while current_slot_start + requested_duration <= workday_end:
            current_slot_end = current_slot_start + requested_duration

            is_booked = False

            for appointment in appointments:
                appointment_start = appointment.date_time

                appointment_end = appointment_start + timedelta(
                    minutes=appointment.duration
                )

                has_overlap = (
                    current_slot_start < appointment_end
                    and current_slot_end > appointment_start
                )

                if has_overlap:
                    is_booked = True
                    break

            is_expired = (
                selected_date == datetime.now(CLINIC_TIMEZONE).date()
                and current_slot_start < now
            )

            if is_booked:
                slot_status = "booked"
            elif is_expired:
                slot_status = "expired"
            else:
                slot_status = "free"

            local_slot_start = current_slot_start.astimezone(
                CLINIC_TIMEZONE,
            )

            slots.append(
                AvailableSlotResponse(
                    time=local_slot_start.time().replace(
                        tzinfo=None,
                    ),
                    status=slot_status,
                )
            )

            current_slot_start += slot_step

        available_count = sum(slot.status == "free" for slot in slots)

        return AvailableSlotsResponse(
            date=selected_date,
            doctor_id=doctor_id,
            duration=duration,
            available_count=available_count,
            booked_count=len(appointments),
            slots=slots,
        )

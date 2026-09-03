from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from database.models.appointments import (
    AppointmentModel,
    AppointmentStatusEnum,
)
from database.models.patient import PatientModel
from database.models.treatments import TreatmentModel
from database.models.users import UserModel
from database.models.visits import VisitModel


AdditionalTreatment1 = aliased(TreatmentModel)
AdditionalTreatment2 = aliased(TreatmentModel)


class StatisticsRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_new_scheduled_patients_count(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> int:
        query = (
            select(
                func.count(
                    func.distinct(PatientModel.id),
                )
            )
            .join(
                UserModel,
                PatientModel.user_id == UserModel.id,
            )
            .join(
                AppointmentModel,
                AppointmentModel.patient_id == PatientModel.id,
            )
            .where(
                UserModel.registration_date >= start_date,
                UserModel.registration_date < end_date,
                AppointmentModel.status
                == AppointmentStatusEnum.SCHEDULED,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_daily_appointments_count(
            self,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status != AppointmentStatusEnum.CANCELLED,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_daily_revenue(
            self,
            start_date: datetime,
            end_date: datetime,
    ) -> float:
        query = (
            select(
                func.coalesce(
                    func.sum(TreatmentModel.price),
                    0,
                )
            )
            .join(
                AppointmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .where(
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                TreatmentModel.is_main.is_(True),
            )
        )

        result = await self.db.execute(query)

        return float(result.scalar_one())

    async def get_appointments_count_by_status(
            self,
            start_date: datetime,
            end_date: datetime,
            status: AppointmentStatusEnum,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status == status,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_weekly_revenue_breakdown(
            self,
            start_date: datetime,
            end_date: datetime,
            doctor_id: int | None = None,
    ) -> tuple[float, float]:
        actual_filters = [
            AppointmentModel.date_time >= start_date,
            AppointmentModel.date_time < end_date,
            AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            TreatmentModel.is_main.is_(True),
        ]

        expected_filters = [
            AppointmentModel.date_time >= start_date,
            AppointmentModel.date_time < end_date,
            AppointmentModel.status.in_(
                [
                    AppointmentStatusEnum.SCHEDULED,
                    AppointmentStatusEnum.CONFIRMED,
                ]
            ),
            TreatmentModel.is_main.is_(True),
        ]

        if doctor_id is not None:
            actual_filters.append(
                AppointmentModel.doctor_id == doctor_id,
            )
            expected_filters.append(
                AppointmentModel.doctor_id == doctor_id,
            )

        actual_query = (
            select(
                func.coalesce(
                    func.sum(TreatmentModel.price),
                    0,
                )
            )
            .join(
                AppointmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .where(*actual_filters)
        )

        expected_query = (
            select(
                func.coalesce(
                    func.sum(TreatmentModel.price),
                    0,
                )
            )
            .join(
                AppointmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .where(*expected_filters)
        )

        actual_result = await self.db.execute(actual_query)
        expected_result = await self.db.execute(expected_query)

        actual = float(actual_result.scalar_one())
        expected = float(expected_result.scalar_one())

        return actual, expected

    async def get_patient_appointments_count(
            self,
            patient_id: int,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.patient_id == patient_id,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_patient_no_shows_count(
            self,
            patient_id: int,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.patient_id == patient_id,
                AppointmentModel.status == AppointmentStatusEnum.NO_SHOW,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_patient_last_hygiene_appointment(
            self,
            patient_id: int,
    ) -> datetime | None:
        hygiene_treatments = (
            "Professional Cleaning",
            "Periodontal Cleaning",
        )

        query = (
            select(func.max(AppointmentModel.date_time))
            .select_from(AppointmentModel)
            .outerjoin(
                VisitModel,
                VisitModel.appointment_id == AppointmentModel.id,
            )
            .outerjoin(
                TreatmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .outerjoin(
                AdditionalTreatment1,
                VisitModel.treatment_add1 == AdditionalTreatment1.id,
            )
            .outerjoin(
                AdditionalTreatment2,
                VisitModel.treatment_add2 == AdditionalTreatment2.id,
            )
            .where(
                AppointmentModel.patient_id == patient_id,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                or_(
                    TreatmentModel.treatment.in_(hygiene_treatments),
                    AdditionalTreatment1.treatment.in_(hygiene_treatments),
                    AdditionalTreatment2.treatment.in_(hygiene_treatments),
                ),
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def get_total_patients_count(
            self,
    ) -> int:
        query = select(
            func.count(PatientModel.id),
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_patients_count_before(
            self,
            before_date: datetime,
    ) -> int:
        query = (
            select(
                func.count(PatientModel.id),
            )
            .join(
                UserModel,
                PatientModel.user_id == UserModel.id,
            )
            .where(
                UserModel.registration_date < before_date,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_new_patients_count(
            self,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        query = (
            select(
                func.count(
                    func.distinct(PatientModel.id),
                )
            )
            .join(
                UserModel,
                PatientModel.user_id == UserModel.id,
            )
            .where(
                UserModel.registration_date >= start_date,
                UserModel.registration_date < end_date,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_returning_patients_count(
            self,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        returning_patients_subquery = (
            select(AppointmentModel.patient_id)
            .where(
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .group_by(AppointmentModel.patient_id)
            .having(func.count(AppointmentModel.id) >= 2)
            .subquery()
        )

        query = select(func.count()).select_from(returning_patients_subquery)

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_inactive_patients_count(
            self,
            before_date: datetime,
    ) -> int:
        inactive_patients = (
            select(AppointmentModel.patient_id)
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .group_by(AppointmentModel.patient_id)
            .having(
                func.max(AppointmentModel.date_time) <= before_date,
            )
            .subquery()
        )

        query = select(func.count()).select_from(inactive_patients)

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_doctor_expected_patients_count(
            self,
            doctor_id: int,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        query = (
            select(
                func.count(
                    func.distinct(AppointmentModel.patient_id),
                )
            )
            .where(
                AppointmentModel.doctor_id == doctor_id,
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status.in_(
                    [
                        AppointmentStatusEnum.SCHEDULED,
                        AppointmentStatusEnum.CONFIRMED,
                    ]
                ),
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_doctor_completed_visits_count(
            self,
            doctor_id: int,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.doctor_id == doctor_id,
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_doctor_cancelled_visits_count(
            self,
            doctor_id: int,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.doctor_id == doctor_id,
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status == AppointmentStatusEnum.CANCELLED,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_doctor_no_show_visits_count(
            self,
            doctor_id: int,
            start_date: datetime,
            end_date: datetime,
    ) -> int:
        query = (
            select(func.count(AppointmentModel.id))
            .where(
                AppointmentModel.doctor_id == doctor_id,
                AppointmentModel.date_time >= start_date,
                AppointmentModel.date_time < end_date,
                AppointmentModel.status == AppointmentStatusEnum.NO_SHOW,
            )
        )

        result = await self.db.execute(query)

        return result.scalar_one()

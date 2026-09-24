from datetime import date
from sqlalchemy import case, exists, func, or_, select, text, union_all
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.appointments import (
    AppointmentModel,
    AppointmentStatusEnum,
)
from database.models.patient import PatientModel
from database.models.treatments import TreatmentModel
from database.models.visits import VisitModel
from database.models.users import UserModel
from schemas.patients import PatientUpdate


class PatientRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def add(self, patient: PatientModel) -> None:
        self.session.add(patient)

    async def get_by_id(
        self,
        patient_id: int,
    ) -> PatientModel | None:
        return await self.session.scalar(
            select(PatientModel).where(
                PatientModel.id == patient_id,
            )
        )

    async def get_details_by_id(
        self,
        patient_id: int,
    ) -> dict | None:
        statement = (
            select(
                PatientModel.id,
                PatientModel.user_id,
                UserModel.first_name,
                UserModel.last_name,
                UserModel.email,
                UserModel.phone_number,
                PatientModel.gender,
                PatientModel.date_of_birth,
                PatientModel.address,
                PatientModel.source,
                UserModel.registration_date.label("created_at"),
            )
            .join(
                UserModel,
                PatientModel.user_id == UserModel.id,
            )
            .where(
                PatientModel.id == patient_id,
            )
        )

        result = await self.session.execute(statement)
        row = result.first()

        if row is None:
            return None

        return dict(row._mapping)

    async def get_completed_appointments_count(
        self,
        patient_id: int,
    ) -> int:
        statement = select(
            func.count(AppointmentModel.id),
        ).where(
            AppointmentModel.patient_id == patient_id,
            AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
        )

        result = await self.session.scalar(statement)

        return result or 0

    async def get_by_user_id(
        self,
        user_id: int,
    ) -> PatientModel | None:
        return await self.session.scalar(
            select(PatientModel).where(
                PatientModel.user_id == user_id,
            )
        )

    @staticmethod
    def _get_last_visit_subquery():
        return (
            select(
                AppointmentModel.patient_id,
                func.max(
                    AppointmentModel.date_time,
                ).label("last_visit_date"),
            )
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .group_by(
                AppointmentModel.patient_id,
            )
            .subquery()
        )

    @staticmethod
    def _get_total_visits_subquery():
        return (
            select(
                AppointmentModel.patient_id,
                func.count(
                    AppointmentModel.id,
                ).label("total_visits"),
            )
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .group_by(
                AppointmentModel.patient_id,
            )
            .subquery()
        )

    @staticmethod
    def _get_last_treatment_subquery():
        latest_completed_appointment = (
            select(
                AppointmentModel.patient_id,
                func.max(
                    AppointmentModel.date_time,
                ).label("last_visit_date"),
            )
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .group_by(
                AppointmentModel.patient_id,
            )
            .subquery()
        )

        return (
            select(
                AppointmentModel.patient_id,
                TreatmentModel.treatment.label("treatment"),
            )
            .join(
                latest_completed_appointment,
                (
                    latest_completed_appointment.c.patient_id
                    == AppointmentModel.patient_id
                )
                & (
                    latest_completed_appointment.c.last_visit_date
                    == AppointmentModel.date_time
                ),
            )
            .join(
                TreatmentModel,
                TreatmentModel.id == AppointmentModel.treatment_id,
            )
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            )
            .subquery()
        )

    @staticmethod
    def _get_next_appointment_subquery():
        return (
            select(
                AppointmentModel.patient_id,
                func.min(
                    AppointmentModel.date_time,
                ).label("next_appointment_date"),
            )
            .where(
                AppointmentModel.date_time > func.now(),
                AppointmentModel.status.in_(
                    [
                        AppointmentStatusEnum.SCHEDULED,
                        AppointmentStatusEnum.CONFIRMED,
                    ]
                ),
            )
            .group_by(
                AppointmentModel.patient_id,
            )
            .subquery()
        )

    @staticmethod
    def _get_next_appointment_status_subquery():
        next_appointment_subquery = PatientRepository._get_next_appointment_subquery()

        return (
            select(
                AppointmentModel.patient_id,
                AppointmentModel.status.label("status"),
            )
            .join(
                next_appointment_subquery,
                (next_appointment_subquery.c.patient_id == AppointmentModel.patient_id)
                & (
                    next_appointment_subquery.c.next_appointment_date
                    == AppointmentModel.date_time
                ),
            )
            .where(
                AppointmentModel.status.in_(
                    [
                        AppointmentStatusEnum.SCHEDULED,
                        AppointmentStatusEnum.CONFIRMED,
                    ]
                ),
            )
            .subquery()
        )

    @staticmethod
    def _get_last_appointment_status_subquery():
        latest_appointment = (
            select(
                AppointmentModel.patient_id,
                func.max(
                    AppointmentModel.date_time,
                ).label("last_appointment_date"),
            )
            .where(
                AppointmentModel.date_time <= func.now(),
            )
            .group_by(
                AppointmentModel.patient_id,
            )
            .subquery()
        )

        return (
            select(
                AppointmentModel.patient_id,
                AppointmentModel.status.label("last_status"),
            )
            .join(
                latest_appointment,
                (latest_appointment.c.patient_id == AppointmentModel.patient_id)
                & (
                    latest_appointment.c.last_appointment_date
                    == AppointmentModel.date_time
                ),
            )
            .subquery()
        )

    @staticmethod
    def _get_last_hygiene_visit_subquery():
        hygiene_treatments = [
            "Professional Cleaning",
            "Periodontal Cleaning",
        ]

        main_hygiene_visits = (
            select(
                AppointmentModel.patient_id.label("patient_id"),
                AppointmentModel.date_time.label("hygiene_date"),
            )
            .join(
                TreatmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                AppointmentModel.date_time <= func.now(),
                TreatmentModel.treatment.in_(
                    hygiene_treatments,
                ),
            )
        )

        hygiene_treatment_ids_subquery = select(TreatmentModel.id).where(
            TreatmentModel.treatment.in_(
                hygiene_treatments,
            )
        )

        additional_hygiene_visits = (
            select(
                AppointmentModel.patient_id.label("patient_id"),
                AppointmentModel.date_time.label("hygiene_date"),
            )
            .join(
                VisitModel,
                VisitModel.appointment_id == AppointmentModel.id,
            )
            .where(
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                AppointmentModel.date_time <= func.now(),
                or_(
                    VisitModel.treatment_add1.in_(
                        hygiene_treatment_ids_subquery,
                    ),
                    VisitModel.treatment_add2.in_(
                        hygiene_treatment_ids_subquery,
                    ),
                ),
            )
        )

        hygiene_visits = union_all(
            main_hygiene_visits,
            additional_hygiene_visits,
        ).subquery()

        return (
            select(
                hygiene_visits.c.patient_id,
                func.max(
                    hygiene_visits.c.hygiene_date,
                ).label("last_hygiene_visit"),
            )
            .group_by(
                hygiene_visits.c.patient_id,
            )
            .subquery()
        )

    @staticmethod
    def _apply_filters(
        statement,
        last_visit_subquery,
        category: str,
        search: str | None,
        doctor_id: int | None,
        visit_date: date | None,
    ):
        if category == "new":
            statement = statement.where(
                UserModel.registration_date >= func.now() - text("INTERVAL '3 days'")
            )

        elif category == "today":
            today_appointment_exists = exists(
                select(AppointmentModel.id).where(
                    AppointmentModel.patient_id == PatientModel.id,
                    func.date(AppointmentModel.date_time) == func.current_date(),
                    AppointmentModel.status != AppointmentStatusEnum.CANCELLED,
                )
            )

            statement = statement.where(
                today_appointment_exists,
            )

        elif category == "inactive":
            statement = statement.where(
                last_visit_subquery.c.last_visit_date.is_not(None),
                last_visit_subquery.c.last_visit_date
                < func.now() - text("INTERVAL '6 months'"),
            )

        if doctor_id is not None:
            doctor_appointment_exists = exists(
                select(AppointmentModel.id).where(
                    AppointmentModel.patient_id == PatientModel.id,
                    AppointmentModel.doctor_id == doctor_id,
                )
            )

            statement = statement.where(
                doctor_appointment_exists,
            )

        if visit_date is not None:
            visit_appointment_exists = exists(
                select(AppointmentModel.id).where(
                    AppointmentModel.patient_id == PatientModel.id,
                    func.date(AppointmentModel.date_time) == visit_date,
                    AppointmentModel.status != AppointmentStatusEnum.CANCELLED,
                )
            )

            statement = statement.where(
                visit_appointment_exists,
            )

        if search:
            search_value = f"%{search.strip()}%"

            statement = statement.where(
                or_(
                    UserModel.first_name.ilike(search_value),
                    UserModel.last_name.ilike(search_value),
                    UserModel.phone_number.ilike(search_value),
                )
            )

        return statement

    async def count(
        self,
        category: str = "all",
        search: str | None = None,
        doctor_id: int | None = None,
        visit_date: date | None = None,
    ) -> int:
        last_visit_subquery = self._get_last_visit_subquery()

        statement = (
            select(
                func.count(PatientModel.id),
            )
            .join(
                UserModel,
                PatientModel.user_id == UserModel.id,
            )
            .outerjoin(
                last_visit_subquery,
                last_visit_subquery.c.patient_id == PatientModel.id,
            )
        )

        statement = self._apply_filters(
            statement=statement,
            last_visit_subquery=last_visit_subquery,
            category=category,
            search=search,
            doctor_id=doctor_id,
            visit_date=visit_date,
        )

        total = await self.session.scalar(statement)

        return total or 0

    async def get_all(
        self,
        category: str = "all",
        search: str | None = None,
        doctor_id: int | None = None,
        visit_date: date | None = None,
        sort_by: str = "last_name",
        sort_order: str = "asc",
        offset: int = 0,
        limit: int = 20,
    ) -> list[dict]:
        last_visit_subquery = self._get_last_visit_subquery()
        total_visits_subquery = self._get_total_visits_subquery()
        last_treatment_subquery = self._get_last_treatment_subquery()
        last_hygiene_subquery = self._get_last_hygiene_visit_subquery()

        total_visits_expression = func.coalesce(
            total_visits_subquery.c.total_visits,
            0,
        )

        status_expression = case(
            (
                last_hygiene_subquery.c.last_hygiene_visit.is_(None),
                "no_history",
            ),
            (
                last_hygiene_subquery.c.last_hygiene_visit
                <= func.now() - text("INTERVAL '6 months'"),
                "overdue",
            ),
            else_="up_to_date",
        )

        statement = (
            select(
                PatientModel.id,
                PatientModel.user_id,
                UserModel.first_name,
                UserModel.last_name,
                UserModel.phone_number,
                PatientModel.date_of_birth,
                PatientModel.source,
                last_visit_subquery.c.last_visit_date,
                last_treatment_subquery.c.treatment,
                total_visits_expression.label("total_visits"),
                status_expression.label("status"),
            )
            .join(
                UserModel,
                PatientModel.user_id == UserModel.id,
            )
            .outerjoin(
                last_visit_subquery,
                last_visit_subquery.c.patient_id == PatientModel.id,
            )
            .outerjoin(
                total_visits_subquery,
                total_visits_subquery.c.patient_id == PatientModel.id,
            )
            .outerjoin(
                last_treatment_subquery,
                last_treatment_subquery.c.patient_id == PatientModel.id,
            )
            .outerjoin(
                last_hygiene_subquery,
                last_hygiene_subquery.c.patient_id == PatientModel.id,
            )
        )

        statement = self._apply_filters(
            statement=statement,
            last_visit_subquery=last_visit_subquery,
            category=category,
            search=search,
            doctor_id=doctor_id,
            visit_date=visit_date,
        )

        sort_columns = {
            "last_name": UserModel.last_name,
            "first_name": UserModel.first_name,
            "last_visit_date": last_visit_subquery.c.last_visit_date,
            "treatment": last_treatment_subquery.c.treatment,
            "total_visits": total_visits_expression,
            "status": status_expression,
        }

        sort_column = sort_columns.get(
            sort_by,
            UserModel.last_name,
        )

        if sort_order.lower() == "desc":
            sort_expression = sort_column.desc().nulls_last()
        else:
            sort_expression = sort_column.asc().nulls_last()

        statement = (
            statement.order_by(
                sort_expression,
                UserModel.last_name,
                UserModel.first_name,
            )
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(statement)

        return [dict(row._mapping) for row in result.all()]

    def update(
        self,
        patient: PatientModel,
        user: UserModel,
        patient_data: PatientUpdate,
    ) -> PatientModel:
        update_data = patient_data.model_dump(
            exclude_unset=True,
        )

        user_fields = {
            "first_name",
            "last_name",
            "email",
            "phone_number",
        }

        for field, value in update_data.items():
            if field in user_fields:
                setattr(
                    user,
                    field,
                    value,
                )
            else:
                setattr(
                    patient,
                    field,
                    value,
                )

        return patient

    async def delete(
        self,
        patient: PatientModel,
    ) -> None:
        await self.session.delete(patient)

    async def get_patient_card_appointments_statistics(
        self,
        patient_id: int,
    ) -> dict:
        completed_visits_query = select(func.count(AppointmentModel.id)).where(
            AppointmentModel.patient_id == patient_id,
            AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
            AppointmentModel.date_time <= func.now(),
        )

        next_appointment_query = select(func.min(AppointmentModel.date_time)).where(
            AppointmentModel.patient_id == patient_id,
            AppointmentModel.date_time > func.now(),
            AppointmentModel.status.in_(
                [
                    AppointmentStatusEnum.SCHEDULED,
                    AppointmentStatusEnum.CONFIRMED,
                ]
            ),
        )

        completed_visits = await self.session.scalar(completed_visits_query)

        next_appointment = await self.session.scalar(next_appointment_query)

        return {
            "completed_visits": completed_visits or 0,
            "next_appointment": next_appointment,
        }

    async def get_patient_card_value_statistics(
        self,
        patient_id: int,
    ) -> dict:
        statement = (
            select(
                func.coalesce(
                    func.sum(VisitModel.amount),
                    0,
                ).label("patient_value"),
                func.avg(VisitModel.amount).label("average_visit_value"),
            )
            .join(
                AppointmentModel,
                VisitModel.appointment_id == AppointmentModel.id,
            )
            .where(
                AppointmentModel.patient_id == patient_id,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                AppointmentModel.date_time <= func.now(),
            )
        )

        result = await self.session.execute(statement)
        row = result.one()

        return {
            "patient_value": row.patient_value,
            "average_visit_value": row.average_visit_value,
        }

    async def get_patient_card_no_show_statistics(
        self,
        patient_id: int,
    ) -> dict:
        statement = select(
            func.count(AppointmentModel.id)
            .filter(
                AppointmentModel.status == AppointmentStatusEnum.NO_SHOW,
                AppointmentModel.date_time < func.now(),
            )
            .label("no_shows"),
            func.count(AppointmentModel.id)
            .filter(
                AppointmentModel.status.in_(
                    [
                        AppointmentStatusEnum.COMPLETED,
                        AppointmentStatusEnum.NO_SHOW,
                    ]
                ),
                AppointmentModel.date_time <= func.now(),
            )
            .label("finished_appointments"),
        ).where(
            AppointmentModel.patient_id == patient_id,
        )

        result = await self.session.execute(statement)
        row = result.one()

        no_shows = row.no_shows or 0
        finished_appointments = row.finished_appointments or 0

        no_show_rate = None

        if finished_appointments > 0:
            no_show_rate = (no_shows / finished_appointments) * 100

        return {
            "no_shows": no_shows,
            "no_show_rate": no_show_rate,
        }

    async def get_patient_card_hygiene_statistics(
        self,
        patient_id: int,
    ) -> dict:
        hygiene_treatments = [
            "Professional Cleaning",
            "Periodontal Cleaning",
        ]

        main_hygiene_query = (
            select(
                func.max(
                    AppointmentModel.date_time,
                )
            )
            .join(
                TreatmentModel,
                AppointmentModel.treatment_id == TreatmentModel.id,
            )
            .where(
                AppointmentModel.patient_id == patient_id,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                AppointmentModel.date_time <= func.now(),
                TreatmentModel.treatment.in_(
                    hygiene_treatments,
                ),
            )
        )

        hygiene_treatment_ids_subquery = select(TreatmentModel.id).where(
            TreatmentModel.treatment.in_(
                hygiene_treatments,
            )
        )

        additional_hygiene_query = (
            select(
                func.max(
                    AppointmentModel.date_time,
                )
            )
            .join(
                VisitModel,
                VisitModel.appointment_id == AppointmentModel.id,
            )
            .where(
                AppointmentModel.patient_id == patient_id,
                AppointmentModel.status == AppointmentStatusEnum.COMPLETED,
                AppointmentModel.date_time <= func.now(),
                or_(
                    VisitModel.treatment_add1.in_(
                        hygiene_treatment_ids_subquery,
                    ),
                    VisitModel.treatment_add2.in_(
                        hygiene_treatment_ids_subquery,
                    ),
                ),
            )
        )

        main_hygiene_date = await self.session.scalar(
            main_hygiene_query,
        )

        additional_hygiene_date = await self.session.scalar(
            additional_hygiene_query,
        )

        hygiene_dates = [
            value
            for value in [
                main_hygiene_date,
                additional_hygiene_date,
            ]
            if value is not None
        ]

        if not hygiene_dates:
            return {
                "hygiene_status": "no_history",
                "last_hygiene_visit": None,
                "months_since_hygiene": None,
            }

        last_hygiene_visit = max(
            hygiene_dates,
        )

        months_since_hygiene_query = select(
            (
                func.extract(
                    "year",
                    func.age(
                        func.now(),
                        last_hygiene_visit,
                    ),
                )
                * 12
                + func.extract(
                    "month",
                    func.age(
                        func.now(),
                        last_hygiene_visit,
                    ),
                )
            )
        )

        months_since_hygiene = await self.session.scalar(
            months_since_hygiene_query,
        )

        months_since_hygiene = int(
            months_since_hygiene or 0,
        )

        if months_since_hygiene >= 6:
            hygiene_status = "overdue"
        else:
            hygiene_status = "up_to_date"

        return {
            "hygiene_status": hygiene_status,
            "last_hygiene_visit": last_hygiene_visit,
            "months_since_hygiene": months_since_hygiene,
        }

    async def get_statistics(self) -> dict:
        total_patients = await self.count(
            category="all",
        )
        new_patients = await self.count(
            category="new",
        )
        patients_today = await self.count(
            category="today",
        )
        inactive_patients = await self.count(
            category="inactive",
        )

        return {
            "total_patients": total_patients,
            "new_patients": new_patients,
            "patients_today": patients_today,
            "inactive_patients": inactive_patients,
        }

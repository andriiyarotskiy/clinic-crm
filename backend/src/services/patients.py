from math import ceil
from datetime import date

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.patient import PatientModel
from database.models.users import UserRoleEnum
from exceptions import DatabaseWriteError
from repositories.patients import PatientRepository
from repositories.users import UserRepository
from repositories.visits import VisitRepository
from schemas.patients import (
    PatientCreate,
    PatientStatisticsResponse,
    PatientUpdate,
    PatientCardStatisticsResponse,
)


class PatientService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.patients = PatientRepository(session)
        self.users = UserRepository(session)
        self.visits = VisitRepository(session)

    async def create_profile(
        self,
        patient_data: PatientCreate,
    ) -> dict:
        user = await self.users.get_by_id(patient_data.user_id)

        if user is None:
            raise ValueError("User not found.")

        if not user.is_active:
            raise ValueError("Patient profile can be created only for an active user.")

        existing_patient = await self.patients.get_by_user_id(
            patient_data.user_id,
        )

        if existing_patient is not None:
            raise ValueError("Patient profile already exists for this user.")

        if user.role != UserRoleEnum.USER:
            raise ValueError("Patient profile can be created only for a regular user.")

        patient_fields = patient_data.model_dump(
            exclude={"phone_number"},
        )
        patient = PatientModel(**patient_fields)

        user.phone_number = patient_data.phone_number

        try:
            user.role = UserRoleEnum.PATIENT
            self.patients.add(patient)
            await self.session.commit()

        except SQLAlchemyError as error:
            await self.session.rollback()
            raise DatabaseWriteError(
                "An error occurred while creating patient profile."
            ) from error

        created_patient = await self.patients.get_by_user_id(
            patient_data.user_id,
        )

        if created_patient is None:
            raise ValueError("Patient profile was not created.")

        patient_details = await self.patients.get_details_by_id(
            created_patient.id,
        )

        if patient_details is None:
            raise ValueError("Patient profile was not created.")

        return patient_details

    async def get_all(
        self,
        category: str = "all",
        search: str | None = None,
        doctor_id: int | None = None,
        visit_date: date | None = None,
        sort_by: str = "last_name",
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        offset = (page - 1) * page_size

        total = await self.patients.count(
            category=category,
            search=search,
            doctor_id=doctor_id,
            visit_date=visit_date,
        )

        items = await self.patients.get_all(
            category=category,
            search=search,
            doctor_id=doctor_id,
            visit_date=visit_date,
            sort_by=sort_by,
            sort_order=sort_order,
            offset=offset,
            limit=page_size,
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
        patient_id: int,
    ) -> dict:
        patient = await self.patients.get_details_by_id(
            patient_id,
        )

        if patient is None:
            raise ValueError("Patient profile not found.")

        visits_count = await self.visits.get_total_by_patient_id(
            patient_id=patient_id,
        )

        completed_appointments_count = (
            await self.patients.get_completed_appointments_count(
                patient_id=patient_id,
            )
        )

        patient["visits_count"] = visits_count
        patient["completed_appointments_count"] = completed_appointments_count

        return patient

    async def update_profile(
        self,
        patient_id: int,
        patient_data: PatientUpdate,
    ) -> dict:
        patient = await self.patients.get_by_id(patient_id)

        if patient is None:
            raise ValueError("Patient profile not found.")

        user = await self.users.get_by_id(patient.user_id)

        if user is None:
            raise ValueError("User not found.")

        if (
            "phone_number" in patient_data.model_fields_set
            and patient_data.phone_number is None
        ):
            raise ValueError("Phone number cannot be null.")

        self.patients.update(
            patient=patient,
            user=user,
            patient_data=patient_data,
        )

        try:
            await self.session.commit()

        except SQLAlchemyError as error:
            await self.session.rollback()
            raise DatabaseWriteError(
                "An error occurred while updating patient profile."
            ) from error

        updated_patient = await self.patients.get_details_by_id(
            patient_id,
        )

        if updated_patient is None:
            raise ValueError("Patient profile not found.")

        return updated_patient

    async def get_patient_card_statistics(
        self,
        patient_id: int,
    ) -> PatientCardStatisticsResponse:
        patient = await self.patients.get_by_id(patient_id)

        if patient is None:
            raise ValueError("Patient profile not found.")

        appointments_statistics = (
            await self.patients.get_patient_card_appointments_statistics(
                patient_id=patient_id,
            )
        )

        value_statistics = await self.patients.get_patient_card_value_statistics(
            patient_id=patient_id,
        )

        no_show_statistics = await self.patients.get_patient_card_no_show_statistics(
            patient_id=patient_id,
        )

        hygiene_statistics = await self.patients.get_patient_card_hygiene_statistics(
            patient_id=patient_id,
        )

        return PatientCardStatisticsResponse(
            **appointments_statistics,
            **value_statistics,
            **no_show_statistics,
            **hygiene_statistics,
        )

    async def get_statistics(
        self,
    ) -> PatientStatisticsResponse:
        statistics = await self.patients.get_statistics()

        return PatientStatisticsResponse(
            **statistics,
        )

    async def delete_profile(
        self,
        patient_id: int,
    ) -> str:
        patient = await self.patients.get_by_id(patient_id)

        if patient is None:
            raise ValueError("Patient profile not found.")

        user = await self.users.get_by_id(patient.user_id)

        if user is None:
            raise ValueError("User not found.")

        try:
            user.role = UserRoleEnum.USER

            await self.patients.delete(patient)
            await self.session.commit()

        except SQLAlchemyError as error:
            await self.session.rollback()
            raise DatabaseWriteError(
                "An error occurred while deleting patient profile."
            ) from error

        return "Patient profile deleted successfully."

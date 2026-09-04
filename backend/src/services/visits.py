from decimal import Decimal
from math import ceil
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.appointments import AppointmentRepository
from repositories.treatments import TreatmentRepository
from repositories.visits import VisitRepository
from schemas.visits import VisitCreate, VisitUpdate
from repositories.patients import PatientRepository

class VisitService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

        self.visits = VisitRepository(session)
        self.appointments = AppointmentRepository(session)
        self.patients = PatientRepository(session)
        self.treatments = TreatmentRepository(session)

    async def _get_additional_treatment(
        self,
        treatment_id: int | None,
    ):
        if treatment_id is None:
            return None

        treatment = await self.treatments.get_by_id(
            treatment_id,
        )

        if treatment is None:
            raise ValueError("Additional treatment not found.")

        if treatment.is_main:
            raise ValueError(
                "Only an additional treatment can be selected for a visit."
            )

        return treatment

    @staticmethod
    def _validate_different_treatments(
        treatment_add1: int | None,
        treatment_add2: int | None,
    ) -> None:
        if (
            treatment_add1 is not None
            and treatment_add2 is not None
            and treatment_add1 == treatment_add2
        ):
            raise ValueError("Additional treatments must be different.")

    async def _calculate_amount(
        self,
        appointment_treatment_id: int,
        treatment_add1: int | None,
        treatment_add2: int | None,
    ) -> Decimal:
        main_treatment = await self.treatments.get_by_id(
            appointment_treatment_id,
        )

        if main_treatment is None:
            raise ValueError("Main appointment treatment not found.")

        if not main_treatment.is_main:
            raise ValueError("Appointment must contain a main treatment.")

        additional_treatment_1 = await self._get_additional_treatment(
            treatment_add1,
        )

        additional_treatment_2 = await self._get_additional_treatment(
            treatment_add2,
        )

        amount = Decimal(main_treatment.price)

        if additional_treatment_1 is not None:
            amount += Decimal(
                additional_treatment_1.price,
            )

        if additional_treatment_2 is not None:
            amount += Decimal(
                additional_treatment_2.price,
            )

        return amount

    async def _serialize_visit(
        self,
        visit,
    ) -> dict[str, Any]:
        appointment = await self.appointments.get_by_id(
            visit.appointment_id,
        )

        if appointment is None:
            raise ValueError("Appointment not found.")

        main_treatment = await self.treatments.get_by_id(
            appointment.treatment_id,
        )

        additional_treatment_1 = (
            await self.treatments.get_by_id(
                visit.treatment_add1,
            )
            if visit.treatment_add1 is not None
            else None
        )

        additional_treatment_2 = (
            await self.treatments.get_by_id(
                visit.treatment_add2,
            )
            if visit.treatment_add2 is not None
            else None
        )

        return {
            "id": visit.id,
            "appointment_id": visit.appointment_id,
            "treatment_add1": visit.treatment_add1,
            "treatment_add2": visit.treatment_add2,
            "diagnosis": visit.diagnosis,
            "description": visit.description,
            "recommendation": visit.recommendation,
            "amount": visit.amount,
            "main_treatment": (
                main_treatment.treatment if main_treatment is not None else None
            ),
            "main_treatment_price": (
                main_treatment.price if main_treatment is not None else None
            ),
            "additional_treatment_1": (
                additional_treatment_1.treatment
                if additional_treatment_1 is not None
                else None
            ),
            "additional_treatment_1_price": (
                additional_treatment_1.price
                if additional_treatment_1 is not None
                else None
            ),
            "additional_treatment_2": (
                additional_treatment_2.treatment
                if additional_treatment_2 is not None
                else None
            ),
            "additional_treatment_2_price": (
                additional_treatment_2.price
                if additional_treatment_2 is not None
                else None
            ),
        }

    async def create(
        self,
        visit_data: VisitCreate,
    ) -> dict[str, Any]:
        appointment = await self.appointments.get_by_id(
            visit_data.appointment_id,
        )

        if appointment is None:
            raise ValueError("Appointment not found.")

        existing_visit = await self.visits.get_by_appointment_id(
            visit_data.appointment_id,
        )

        if existing_visit is not None:
            raise ValueError("A visit already exists for this appointment.")

        self._validate_different_treatments(
            treatment_add1=visit_data.treatment_add1,
            treatment_add2=visit_data.treatment_add2,
        )

        amount = await self._calculate_amount(
            appointment_treatment_id=appointment.treatment_id,
            treatment_add1=visit_data.treatment_add1,
            treatment_add2=visit_data.treatment_add2,
        )

        try:
            visit = self.visits.add(
                visit_data=visit_data,
                amount=amount,
            )

            await self.session.commit()
            await self.session.refresh(visit)

        except SQLAlchemyError:
            await self.session.rollback()
            raise

        return await self._serialize_visit(
            visit,
        )

    async def get_by_id(
        self,
        visit_id: int,
    ) -> dict[str, Any]:
        visit = await self.visits.get_by_id(
            visit_id,
        )

        if visit is None:
            raise ValueError("Visit not found.")

        return await self._serialize_visit(
            visit,
        )

    async def get_by_appointment_id(
        self,
        appointment_id: int,
    ) -> dict[str, Any]:
        appointment = await self.appointments.get_by_id(
            appointment_id,
        )

        if appointment is None:
            raise ValueError("Appointment not found.")

        visit = await self.visits.get_by_appointment_id(
            appointment_id,
        )

        if visit is None:
            raise ValueError("Visit not found for this appointment.")

        return await self._serialize_visit(
            visit,
        )

    async def get_clinical_notes_by_patient_id(
            self,
            patient_id: int,
            page: int = 1,
            page_size: int = 20,
    ) -> dict[str, Any]:
        patient = await self.patients.get_by_id(
            patient_id=patient_id,
        )

        if patient is None:
            raise ValueError("Patient not found.")

        offset = (page - 1) * page_size

        total = await self.visits.get_total_by_patient_id(
            patient_id=patient_id,
        )

        clinical_notes = await self.visits.get_by_patient_id(
            patient_id=patient_id,
            limit=page_size,
            offset=offset,
        )

        return {
            "patient_id": patient_id,
            "clinical_notes": clinical_notes,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": ceil(total / page_size) if total else 0,
        }

    async def update(
        self,
        visit_id: int,
        visit_data: VisitUpdate,
    ) -> dict[str, Any]:
        visit = await self.visits.get_by_id(
            visit_id,
        )

        if visit is None:
            raise ValueError("Visit not found.")

        appointment = await self.appointments.get_by_id(
            visit.appointment_id,
        )

        if appointment is None:
            raise ValueError("Appointment not found.")

        update_data = visit_data.model_dump(
            exclude_unset=True,
        )

        new_treatment_add1 = update_data.get(
            "treatment_add1",
            visit.treatment_add1,
        )

        new_treatment_add2 = update_data.get(
            "treatment_add2",
            visit.treatment_add2,
        )

        self._validate_different_treatments(
            treatment_add1=new_treatment_add1,
            treatment_add2=new_treatment_add2,
        )

        amount = await self._calculate_amount(
            appointment_treatment_id=appointment.treatment_id,
            treatment_add1=new_treatment_add1,
            treatment_add2=new_treatment_add2,
        )

        try:
            self.visits.update(
                visit=visit,
                visit_data=visit_data,
                amount=amount,
            )

            await self.session.commit()
            await self.session.refresh(visit)

        except SQLAlchemyError:
            await self.session.rollback()
            raise

        return await self._serialize_visit(
            visit,
        )

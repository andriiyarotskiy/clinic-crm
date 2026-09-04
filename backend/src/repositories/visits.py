from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload

from database.models.appointments import AppointmentModel
from database.models.doctors import DoctorModel
from database.models.treatments import TreatmentModel
from database.models.users import UserModel
from database.models.visits import VisitModel
from schemas.visits import VisitCreate, VisitUpdate


class VisitRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def add(
        self,
        visit_data: VisitCreate,
        amount,
    ) -> VisitModel:
        visit = VisitModel(
            appointment_id=visit_data.appointment_id,
            treatment_add1=visit_data.treatment_add1,
            treatment_add2=visit_data.treatment_add2,
            diagnosis=visit_data.diagnosis,
            description=visit_data.description,
            recommendation=visit_data.recommendation,
            amount=amount,
        )

        self.session.add(visit)

        return visit

    async def get_by_id(
        self,
        visit_id: int,
    ) -> VisitModel | None:
        statement = (
            select(VisitModel)
            .options(
                joinedload(VisitModel.appointment),
                joinedload(VisitModel.additional_treatment_1),
                joinedload(VisitModel.additional_treatment_2),
            )
            .where(
                VisitModel.id == visit_id,
            )
        )

        return await self.session.scalar(statement)

    async def get_by_appointment_id(
        self,
        appointment_id: int,
    ) -> VisitModel | None:
        statement = select(VisitModel).where(
            VisitModel.appointment_id == appointment_id,
        )

        return await self.session.scalar(statement)

    async def get_by_patient_id(
        self,
        patient_id: int,
        limit: int,
        offset: int,
    ) -> list[dict]:
        main_treatment = aliased(TreatmentModel)
        additional_treatment_1 = aliased(TreatmentModel)
        additional_treatment_2 = aliased(TreatmentModel)

        statement = (
            select(
                VisitModel.id.label("visit_id"),
                VisitModel.appointment_id,
                VisitModel.diagnosis,
                VisitModel.description,
                VisitModel.recommendation,
                VisitModel.amount,
                AppointmentModel.doctor_id,
                AppointmentModel.date_time.label("visit_date"),
                UserModel.first_name.label("doctor_first_name"),
                UserModel.last_name.label("doctor_last_name"),
                main_treatment.treatment.label("main_treatment"),
                main_treatment.price.label("main_treatment_price"),
                additional_treatment_1.treatment.label(
                    "additional_treatment_1",
                ),
                additional_treatment_1.price.label(
                    "additional_treatment_1_price",
                ),
                additional_treatment_2.treatment.label(
                    "additional_treatment_2",
                ),
                additional_treatment_2.price.label(
                    "additional_treatment_2_price",
                ),
            )
            .join(
                AppointmentModel,
                VisitModel.appointment_id == AppointmentModel.id,
            )
            .join(
                DoctorModel,
                AppointmentModel.doctor_id == DoctorModel.id,
            )
            .join(
                UserModel,
                DoctorModel.user_id == UserModel.id,
            )
            .join(
                main_treatment,
                AppointmentModel.treatment_id == main_treatment.id,
            )
            .outerjoin(
                additional_treatment_1,
                VisitModel.treatment_add1 == additional_treatment_1.id,
            )
            .outerjoin(
                additional_treatment_2,
                VisitModel.treatment_add2 == additional_treatment_2.id,
            )
            .where(
                AppointmentModel.patient_id == patient_id,
            )
            .order_by(
                AppointmentModel.date_time.desc(),
            )
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(statement)

        return [
            dict(row._mapping)
            for row in result.all()
        ]

    async def get_total_by_patient_id(
        self,
        patient_id: int,
    ) -> int:
        statement = (
            select(
                func.count(VisitModel.id),
            )
            .join(
                AppointmentModel,
                VisitModel.appointment_id == AppointmentModel.id,
            )
            .where(
                AppointmentModel.patient_id == patient_id,
            )
        )

        result = await self.session.execute(statement)

        return result.scalar_one()

    def update(
        self,
        visit: VisitModel,
        visit_data: VisitUpdate,
        amount,
    ) -> VisitModel:
        update_data = visit_data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(
                visit,
                field,
                value,
            )

        visit.amount = amount

        return visit

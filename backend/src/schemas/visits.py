from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class VisitCreate(BaseModel):
    appointment_id: int = Field(
        gt=0,
    )
    treatment_add1: int | None = Field(
        default=None,
        gt=0,
    )
    treatment_add2: int | None = Field(
        default=None,
        gt=0,
    )
    diagnosis: str | None = Field(
        default=None,
        max_length=2000,
    )
    description: str | None = Field(
        default=None,
        max_length=5000,
    )
    recommendation: str | None = Field(
        default=None,
        max_length=5000,
    )


class VisitUpdate(BaseModel):
    treatment_add1: int | None = Field(
        default=None,
        gt=0,
    )
    treatment_add2: int | None = Field(
        default=None,
        gt=0,
    )
    diagnosis: str | None = Field(
        default=None,
        max_length=2000,
    )
    description: str | None = Field(
        default=None,
        max_length=5000,
    )
    recommendation: str | None = Field(
        default=None,
        max_length=5000,
    )


class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    appointment_id: int
    treatment_add1: int | None
    treatment_add2: int | None
    diagnosis: str | None
    description: str | None
    recommendation: str | None
    amount: Decimal

    main_treatment: str | None = None
    main_treatment_price: Decimal | None = None

    additional_treatment_1: str | None = None
    additional_treatment_1_price: Decimal | None = None

    additional_treatment_2: str | None = None
    additional_treatment_2_price: Decimal | None = None


class PatientClinicalNoteResponse(BaseModel):
    visit_id: int
    appointment_id: int

    doctor_id: int
    doctor_first_name: str
    doctor_last_name: str

    visit_date: datetime

    diagnosis: str | None
    description: str | None
    recommendation: str | None
    amount: Decimal

    main_treatment: str | None = None
    main_treatment_price: Decimal | None = None

    additional_treatment_1: str | None = None
    additional_treatment_1_price: Decimal | None = None

    additional_treatment_2: str | None = None
    additional_treatment_2_price: Decimal | None = None


class PatientClinicalNotesResponse(BaseModel):
    patient_id: int
    clinical_notes: list[PatientClinicalNoteResponse]

    total: int
    page: int
    page_size: int
    pages: int

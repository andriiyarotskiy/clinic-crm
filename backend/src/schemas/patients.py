import enum
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator


class PatientGenderEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class PatientSourceEnum(str, enum.Enum):
    ORGANIC_SEARCH = "organic_search"
    PAID_SEARCH = "paid_search"
    ORGANIC_SOCIAL = "organic_social"
    PAID_SOCIAL = "paid_social"
    REFERRAL = "referral"
    DIRECT = "direct"
    OFFLINE_AD = "offline_ad"
    OTHER = "other"
    UNKNOWN = "unknown"


class PatientBase(BaseModel):
    gender: PatientGenderEnum | None = None
    date_of_birth: date | None = None
    address: str | None = None
    source: PatientSourceEnum = PatientSourceEnum.UNKNOWN

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(
        cls,
        value: date | None,
    ) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("Date of birth cannot be in the future.")

        return value


class PatientCreate(PatientBase):
    user_id: int
    phone_number: str


class PatientUpdate(PatientBase):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    source: PatientSourceEnum | None = None


class PatientResponse(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str | None = None
    visits_count: int = 0
    completed_appointments_count: int = 0


class PatientListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    first_name: str
    last_name: str
    phone_number: str | None = None
    date_of_birth: date | None = None
    source: PatientSourceEnum = PatientSourceEnum.UNKNOWN

    last_visit_date: datetime | None = None
    treatment: str | None = None
    total_visits: int = 0
    status: str | None = None


class PaginatedPatientResponse(BaseModel):
    items: list[PatientListResponse]
    total: int
    page: int
    page_size: int
    pages: int


class PatientStatisticsResponse(BaseModel):
    total_patients: int
    new_patients: int
    patients_today: int
    inactive_patients: int

class PatientCardStatisticsResponse(BaseModel):
    completed_visits: int
    next_appointment: datetime | None = None

    patient_value: float
    average_visit_value: float | None = None

    no_shows: int
    no_show_rate: float | None = None

    hygiene_status: str
    last_hygiene_visit: datetime | None = None
    months_since_hygiene: int | None = None


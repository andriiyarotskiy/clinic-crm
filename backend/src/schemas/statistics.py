from pydantic import BaseModel
from datetime import datetime


class StatisticCardResponse(BaseModel):
    total: int
    change: float | None


class DailyRevenueResponse(BaseModel):
    total: float
    change: float | None


class AppointmentOutcomesResponse(BaseModel):
    total: int
    completed: int
    no_show: int
    cancelled: int


class WeeklyRevenueDayResponse(BaseModel):
    day: str
    actual: float
    expected: float
    total: float
    is_peak_day: bool


class WeeklyRevenueResponse(BaseModel):
    total: float
    change: float | None
    data: list[WeeklyRevenueDayResponse]


class PatientAppointmentsResponse(BaseModel):
    total: int

class PatientNoShowsResponse(BaseModel):
    total: int


class PatientHygieneResponse(BaseModel):
    status: str
    last_hygiene_visit: datetime | None
    months_since_last_visit: int | None

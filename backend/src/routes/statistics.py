from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session_postgresql import get_postgresql_db
from repositories.statistics import StatisticsRepository
from schemas.statistics import (
    AppointmentOutcomesResponse,
    DailyRevenueResponse,
    PatientAppointmentsResponse,
    PatientHygieneResponse,
    PatientNoShowsResponse,
    StatisticCardResponse,
    WeeklyRevenueResponse,
)
from security.permissions import DoctorAdminOrSuperAdminDep
from services.statistics import StatisticsService


router = APIRouter(
    tags=["statistics"],
)


@router.get(
    "/patients-today",
    response_model=StatisticCardResponse,
)
async def get_patients_today_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_patients_today_statistics()


@router.get(
    "/daily-appointments",
    response_model=StatisticCardResponse,
)
async def get_daily_appointments_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_daily_appointments_statistics()


@router.get(
    "/daily-revenue",
    response_model=DailyRevenueResponse,
)
async def get_daily_revenue_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> DailyRevenueResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_daily_revenue_statistics()


@router.get(
    "/monthly-revenue",
    response_model=DailyRevenueResponse,
)
async def get_monthly_revenue_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> DailyRevenueResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_monthly_revenue_statistics()


@router.get(
    "/appointment-outcomes",
    response_model=AppointmentOutcomesResponse,
)
async def get_appointment_outcomes(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> AppointmentOutcomesResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_appointment_outcomes()


@router.get(
    "/weekly-revenue",
    response_model=WeeklyRevenueResponse,
)
async def get_weekly_revenue_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> WeeklyRevenueResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_weekly_revenue_statistics()


@router.get(
    "/patients/total",
    response_model=StatisticCardResponse,
)
async def get_total_patients_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_total_patients_statistics()


@router.get(
    "/patients/{patient_id}/appointments",
    response_model=PatientAppointmentsResponse,
)
async def get_patient_appointments_statistics(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientAppointmentsResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_patient_appointments_statistics(
        patient_id=patient_id,
    )


@router.get(
    "/patients/{patient_id}/no-shows",
    response_model=PatientNoShowsResponse,
)
async def get_patient_no_shows_statistics(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientNoShowsResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_patient_no_shows_statistics(
        patient_id=patient_id,
    )


@router.get(
    "/patients/{patient_id}/hygiene",
    response_model=PatientHygieneResponse,
)
async def get_patient_hygiene_statistics(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientHygieneResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_patient_hygiene_statistics(
        patient_id=patient_id,
    )

@router.get(
    "/patients/new",
    response_model=StatisticCardResponse,
)
async def get_new_patients_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_new_patients_statistics()

@router.get(
    "/patients/returning",
    response_model=StatisticCardResponse,
)
async def get_returning_patients_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_returning_patients_statistics()

@router.get(
    "/patients/inactive",
    response_model=StatisticCardResponse,
)
async def get_inactive_patients_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_inactive_patients_statistics()

@router.get(
    "/doctors/{doctor_id}/patients-today",
    response_model=StatisticCardResponse,
)
async def get_doctor_patients_today_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_patients_today_statistics(
        doctor_id=doctor_id,
    )

@router.get(
    "/doctors/{doctor_id}/completed-visits",
    response_model=StatisticCardResponse,
)
async def get_doctor_completed_visits_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_completed_visits_statistics(
        doctor_id=doctor_id,
    )

@router.get(
    "/doctors/{doctor_id}/cancelled-visits",
    response_model=StatisticCardResponse,
)
async def get_doctor_cancelled_visits_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_cancelled_visits_statistics(
        doctor_id=doctor_id,
    )

@router.get(
    "/doctors/{doctor_id}/no-shows",
    response_model=StatisticCardResponse,
)
async def get_doctor_no_show_visits_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_no_show_visits_statistics(
        doctor_id=doctor_id,
    )

@router.get(
    "/doctors/{doctor_id}/weekly-revenue",
    response_model=WeeklyRevenueResponse,
)
async def get_doctor_weekly_revenue_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> WeeklyRevenueResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_weekly_revenue_statistics(
        doctor_id=doctor_id,
    )

@router.get(
    "/doctors/{doctor_id}/daily-appointments",
    response_model=StatisticCardResponse,
)
async def get_doctor_daily_appointments_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> StatisticCardResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_daily_appointments_statistics(
        doctor_id=doctor_id,
    )


@router.get(
    "/doctors/{doctor_id}/daily-revenue",
    response_model=DailyRevenueResponse,
)
async def get_doctor_daily_revenue_statistics(
    doctor_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> DailyRevenueResponse:
    repository = StatisticsRepository(db)
    service = StatisticsService(repository)

    return await service.get_doctor_daily_revenue_statistics(
        doctor_id=doctor_id,
    )

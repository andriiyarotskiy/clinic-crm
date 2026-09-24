from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session_postgresql import get_postgresql_db
from exceptions import DatabaseWriteError
from schemas.patients import (
    PaginatedPatientResponse,
    PatientCardStatisticsResponse,
    PatientCreate,
    PatientResponse,
    PatientStatisticsResponse,
    PatientUpdate,
)
from schemas.visits import PatientClinicalNotesResponse
from security.permissions import DoctorAdminOrSuperAdminDep
from services.patients import PatientService
from services.visits import VisitService

router = APIRouter()


@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_patient(
    patient_data: PatientCreate,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientResponse:
    service = PatientService(db)

    try:
        return await service.create_profile(patient_data)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except DatabaseWriteError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error


@router.get(
    "/",
    response_model=PaginatedPatientResponse,
)
async def get_patients(
    current_user: DoctorAdminOrSuperAdminDep,
    category: str = Query("all"),
    search: str | None = Query(None),
    doctor_id: int | None = Query(None, ge=1),
    visit_date: date | None = Query(None),
    sort_by: str = Query("last_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_postgresql_db),
) -> PaginatedPatientResponse:
    service = PatientService(db)

    return await service.get_all(
        category=category,
        search=search,
        doctor_id=doctor_id,
        visit_date=visit_date,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/statistics",
    response_model=PatientStatisticsResponse,
)
async def get_patient_statistics(
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientStatisticsResponse:
    service = PatientService(db)

    return await service.get_statistics()


@router.get(
    "/{patient_id}/statistics",
    response_model=PatientCardStatisticsResponse,
)
async def get_patient_card_statistics(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientCardStatisticsResponse:
    service = PatientService(db)

    try:
        return await service.get_patient_card_statistics(
            patient_id=patient_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.get(
    "/{patient_id}/clinical-notes/",
    response_model=PatientClinicalNotesResponse,
    status_code=status.HTTP_200_OK,
)
async def get_patient_clinical_notes(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientClinicalNotesResponse:
    service = VisitService(db)

    try:
        return await service.get_clinical_notes_by_patient_id(
            patient_id=patient_id,
            page=page,
            page_size=page_size,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.get(
    "/{patient_id}/",
    response_model=PatientResponse,
)
async def get_patient(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientResponse:
    service = PatientService(db)

    try:
        return await service.get_by_id(patient_id)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{patient_id}/",
    response_model=PatientResponse,
)
async def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> PatientResponse:
    service = PatientService(db)

    try:
        return await service.update_profile(
            patient_id=patient_id,
            patient_data=patient_data,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except DatabaseWriteError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error


@router.delete(
    "/{patient_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_patient(
    patient_id: int,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> None:
    service = PatientService(db)

    try:
        await service.delete_profile(patient_id)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except DatabaseWriteError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error

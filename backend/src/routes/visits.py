from typing import NoReturn

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from database.session_postgresql import get_postgresql_db
from schemas.visits import (
    VisitCreate,
    VisitResponse,
    VisitUpdate,
    PatientClinicalNotesResponse,
)
from security.permissions import DoctorAdminOrSuperAdminDep
from services.visits import VisitService

router = APIRouter(
    tags=["visits"],
)


def raise_http_error(error: ValueError) -> NoReturn:
    message = str(error)

    not_found_messages = {
        "Visit not found.",
        "Visit not found for this appointment.",
        "Appointment not found.",
        "Patient not found.",
        "Main appointment treatment not found.",
        "Additional treatment not found.",
    }

    if message in not_found_messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        ) from error

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message,
    ) from error


@router.post(
    "/",
    response_model=VisitResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_visit(
    visit_data: VisitCreate,
    current_user: DoctorAdminOrSuperAdminDep,
    db: AsyncSession = Depends(get_postgresql_db),
) -> VisitResponse:
    service = VisitService(db)

    try:
        return await service.create(
            visit_data=visit_data,
        )
    except ValueError as error:
        raise_http_error(error)


@router.get(
    "/by-appointment/{appointment_id}/",
    response_model=VisitResponse,
    status_code=status.HTTP_200_OK,
)
async def get_visit_by_appointment(
    current_user: DoctorAdminOrSuperAdminDep,
    appointment_id: int = Path(
        gt=0,
    ),
    db: AsyncSession = Depends(get_postgresql_db),
) -> VisitResponse:
    service = VisitService(db)

    try:
        return await service.get_by_appointment_id(
            appointment_id=appointment_id,
        )
    except ValueError as error:
        raise_http_error(error)


@router.get(
    "/by-patient/{patient_id}/clinical-notes/",
    response_model=PatientClinicalNotesResponse,
    status_code=status.HTTP_200_OK,
)
async def get_patient_clinical_notes(
    current_user: DoctorAdminOrSuperAdminDep,
    patient_id: int = Path(
        gt=0,
    ),
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
        raise_http_error(error)


@router.get(
    "/{visit_id}/",
    response_model=VisitResponse,
    status_code=status.HTTP_200_OK,
)
async def get_visit(
    current_user: DoctorAdminOrSuperAdminDep,
    visit_id: int = Path(
        gt=0,
    ),
    db: AsyncSession = Depends(get_postgresql_db),
) -> VisitResponse:
    service = VisitService(db)

    try:
        return await service.get_by_id(
            visit_id=visit_id,
        )
    except ValueError as error:
        raise_http_error(error)


@router.patch(
    "/{visit_id}/",
    response_model=VisitResponse,
    status_code=status.HTTP_200_OK,
)
async def update_visit(
    visit_data: VisitUpdate,
    current_user: DoctorAdminOrSuperAdminDep,
    visit_id: int = Path(
        gt=0,
    ),
    db: AsyncSession = Depends(get_postgresql_db),
) -> VisitResponse:
    service = VisitService(db)

    try:
        return await service.update(
            visit_id=visit_id,
            visit_data=visit_data,
        )
    except ValueError as error:
        raise_http_error(error)

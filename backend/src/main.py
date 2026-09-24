from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from config import get_settings
from routes import (
    accounts_router,
    appointments_router,
    doctors_router,
    patients_router,
    statistics_router,
    treatments_router,
    visits_router,
)


settings = get_settings()

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    openapi_tags=[
        {
            "name": "accounts",
            "description": ("Authentication, account lifecycle and user roles."),
        },
        {
            "name": "doctors",
            "description": "Doctor profiles and avatars.",
        },
        {
            "name": "patients",
            "description": "Patient profiles.",
        },
        {
            "name": "appointments",
            "description": "Appointments.",
        },
        {
            "name": "treatments",
            "description": "Dental treatment catalog.",
        },
        {
            "name": "visits",
            "description": "Completed visit details and treatment totals.",
        },
        {
            "name": "statistics",
            "description": "Clinic dashboard statistics.",
        },
    ],
)

app.include_router(
    accounts_router,
    prefix="/accounts",
    tags=["accounts"],
)

app.include_router(
    appointments_router,
    prefix="/appointments",
    tags=["appointments"],
)

app.include_router(
    doctors_router,
    prefix="/doctors",
    tags=["doctors"],
)

app.include_router(
    patients_router,
    prefix="/patients",
    tags=["patients"],
)

app.include_router(
    treatments_router,
    prefix="/treatments",
    tags=["treatments"],
)

app.include_router(
    visits_router,
    prefix="/visits",
    tags=["visits"],
)

app.include_router(
    statistics_router,
    prefix="/statistics",
    tags=["statistics"],
)

origins = [
    settings.FRONTEND_BASE_URL,
]

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health/",
    tags=["health"],
)
async def health_check():
    return {
        "status": "ok",
    }

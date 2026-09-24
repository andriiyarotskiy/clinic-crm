from routes.accounts import router as accounts_router
from routes.appointments import router as appointments_router
from routes.doctors import router as doctors_router
from routes.patients import router as patients_router
from routes.statistics import router as statistics_router
from routes.treatments import router as treatments_router
from routes.visits import router as visits_router


__all__ = [
    "accounts_router",
    "appointments_router",
    "doctors_router",
    "patients_router",
    "statistics_router",
    "treatments_router",
    "visits_router",
]

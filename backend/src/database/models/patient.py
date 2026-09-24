from __future__ import annotations

import enum
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base

if TYPE_CHECKING:
    from database.models.users import UserModel


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


class PatientModel(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    gender: Mapped[PatientGenderEnum | None] = mapped_column(String(20))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    city: Mapped[str | None] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String(255))
    source: Mapped[PatientSourceEnum] = mapped_column(
        Enum(
            PatientSourceEnum,
            name="patient_source_enum",
            values_callable=lambda enum_class: [item.value for item in enum_class],
        ),
        nullable=False,
        default=PatientSourceEnum.UNKNOWN,
    )

    user: Mapped[UserModel] = relationship(back_populates="patient")

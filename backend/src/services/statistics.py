import calendar
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from database.models.appointments import AppointmentStatusEnum
from dateutil.relativedelta import relativedelta
from repositories.statistics import StatisticsRepository
from schemas.statistics import (
    AppointmentOutcomesResponse,
    DailyRevenueResponse,
    StatisticCardResponse,
    WeeklyRevenueDayResponse,
    WeeklyRevenueResponse,
    PatientAppointmentsResponse,
    PatientNoShowsResponse,
    PatientHygieneResponse,
)


CLINIC_TIMEZONE = ZoneInfo("Europe/Kyiv")


class StatisticsService:
    def __init__(self, repository: StatisticsRepository) -> None:
        self.repository = repository

    async def get_patients_today_statistics(
        self,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_new_scheduled_patients_count(
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_new_scheduled_patients_count(
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_daily_appointments_statistics(
            self,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_daily_appointments_count(
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_daily_appointments_count(
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_daily_revenue_statistics(
            self,
    ) -> DailyRevenueResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_daily_revenue(
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_daily_revenue(
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return DailyRevenueResponse(
            total=total,
            change=change,
        )

    async def get_monthly_revenue_statistics(
            self,
    ) -> DailyRevenueResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        current_month_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        tomorrow_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        ) + timedelta(days=1)

        if now_local.month == 1:
            previous_year = now_local.year - 1
            previous_month = 12
        else:
            previous_year = now_local.year
            previous_month = now_local.month - 1

        previous_month_start_local = datetime(
            year=previous_year,
            month=previous_month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        last_day_of_previous_month = calendar.monthrange(
            previous_year,
            previous_month,
        )[1]

        if now_local.day <= last_day_of_previous_month:
            previous_day = now_local.day

            previous_period_last_day_local = datetime(
                year=previous_year,
                month=previous_month,
                day=previous_day,
                tzinfo=CLINIC_TIMEZONE,
            )

        else:
            previous_period_last_day_local = datetime(
                year=previous_year,
                month=previous_month,
                day=last_day_of_previous_month,
                tzinfo=CLINIC_TIMEZONE,
            )

            while previous_period_last_day_local.weekday() >= 5:
                previous_period_last_day_local -= timedelta(days=1)

        previous_period_end_local = (
                previous_period_last_day_local + timedelta(days=1)
        )

        current_month_start = current_month_start_local.astimezone(
            timezone.utc,
        )
        tomorrow_start = tomorrow_start_local.astimezone(
            timezone.utc,
        )
        previous_month_start = previous_month_start_local.astimezone(
            timezone.utc,
        )
        previous_period_end = previous_period_end_local.astimezone(
            timezone.utc,
        )

        total = await self.repository.get_daily_revenue(
            start_date=current_month_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_daily_revenue(
            start_date=previous_month_start,
            end_date=previous_period_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return DailyRevenueResponse(
            total=total,
            change=change,
        )

    async def get_appointment_outcomes(
            self,
    ) -> AppointmentOutcomesResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        current_month_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        tomorrow_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        ) + timedelta(days=1)

        current_month_start = current_month_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        completed = await self.repository.get_appointments_count_by_status(
            start_date=current_month_start,
            end_date=tomorrow_start,
            status=AppointmentStatusEnum.COMPLETED,
        )

        no_show = await self.repository.get_appointments_count_by_status(
            start_date=current_month_start,
            end_date=tomorrow_start,
            status=AppointmentStatusEnum.NO_SHOW,
        )

        cancelled = await self.repository.get_appointments_count_by_status(
            start_date=current_month_start,
            end_date=tomorrow_start,
            status=AppointmentStatusEnum.CANCELLED,
        )

        total = completed + no_show + cancelled

        return AppointmentOutcomesResponse(
            total=total,
            completed=completed,
            no_show=no_show,
            cancelled=cancelled,
        )

    async def get_doctor_weekly_revenue_statistics(
            self,
            doctor_id: int,
    ) -> WeeklyRevenueResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )

        week_start_local = today_start_local - timedelta(
            days=now_local.weekday(),
        )

        previous_week_start_local = week_start_local - timedelta(days=7)

        data: list[WeeklyRevenueDayResponse] = []
        weekly_total = 0.0

        for day_offset in range(7):
            day_start_local = week_start_local + timedelta(days=day_offset)

            # Saturday and Sunday are placeholders.
            if day_offset >= 5:
                data.append(
                    WeeklyRevenueDayResponse(
                        day=day_start_local.strftime("%a"),
                        actual=0.0,
                        expected=0.0,
                        total=0.0,
                        is_peak_day=False,
                    )
                )
                continue

            day_end_local = day_start_local + timedelta(days=1)

            day_start = day_start_local.astimezone(timezone.utc)
            day_end = day_end_local.astimezone(timezone.utc)

            actual, expected = (
                await self.repository.get_weekly_revenue_breakdown(
                    start_date=day_start,
                    end_date=day_end,
                    doctor_id=doctor_id,
                )
            )

            if day_start_local.date() > now_local.date():
                actual = 0.0

            day_total = actual + expected
            weekly_total += day_total

            data.append(
                WeeklyRevenueDayResponse(
                    day=day_start_local.strftime("%a"),
                    actual=actual,
                    expected=expected,
                    total=day_total,
                    is_peak_day=False,
                )
            )

        previous_week_start = previous_week_start_local.astimezone(
            timezone.utc,
        )

        previous_week_end = (
                previous_week_start_local + timedelta(days=5)
        ).astimezone(timezone.utc)

        previous_actual, previous_expected = (
            await self.repository.get_weekly_revenue_breakdown(
                start_date=previous_week_start,
                end_date=previous_week_end,
                doctor_id=doctor_id,
            )
        )

        previous_week_total = previous_actual + previous_expected

        if previous_week_total == 0:
            change = 0.0 if weekly_total == 0 else None
        else:
            change = round(
                (
                        (weekly_total - previous_week_total)
                        / previous_week_total
                )
                * 100,
                1,
            )

        weekday_data = data[:5]

        if weekday_data:
            peak_value = max(item.total for item in weekday_data)

            if peak_value > 0:
                for item in weekday_data:
                    if item.total == peak_value:
                        item.is_peak_day = True
                        break

        return WeeklyRevenueResponse(
            total=weekly_total,
            change=change,
            data=data,
        )

    async def get_weekly_revenue_statistics(
            self,
    ) -> WeeklyRevenueResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )

        week_start_local = today_start_local - timedelta(
            days=now_local.weekday(),
        )

        previous_week_start_local = week_start_local - timedelta(days=7)

        data: list[WeeklyRevenueDayResponse] = []
        weekly_total = 0.0

        for day_offset in range(7):
            day_start_local = week_start_local + timedelta(days=day_offset)

            # Saturday and Sunday are placeholders.
            if day_offset >= 5:
                data.append(
                    WeeklyRevenueDayResponse(
                        day=day_start_local.strftime("%a"),
                        actual=0.0,
                        expected=0.0,
                        total=0.0,
                        is_peak_day=False,
                    )
                )
                continue

            day_end_local = day_start_local + timedelta(days=1)

            day_start = day_start_local.astimezone(timezone.utc)
            day_end = day_end_local.astimezone(timezone.utc)

            actual, expected = (
                await self.repository.get_weekly_revenue_breakdown(
                    start_date=day_start,
                    end_date=day_end,
                )
            )

            if day_start_local.date() > now_local.date():
                actual = 0.0

            day_total = actual + expected
            weekly_total += day_total

            data.append(
                WeeklyRevenueDayResponse(
                    day=day_start_local.strftime("%a"),
                    actual=actual,
                    expected=expected,
                    total=day_total,
                    is_peak_day=False,
                )
            )

        previous_week_start = previous_week_start_local.astimezone(
            timezone.utc
        )

        previous_week_end = (
                previous_week_start_local + timedelta(days=5)
        ).astimezone(timezone.utc)

        previous_actual, previous_expected = (
            await self.repository.get_weekly_revenue_breakdown(
                start_date=previous_week_start,
                end_date=previous_week_end,
            )
        )

        previous_week_total = previous_actual + previous_expected

        if previous_week_total == 0:
            change = 0.0 if weekly_total == 0 else None
        else:
            change = round(
                (
                        (weekly_total - previous_week_total)
                        / previous_week_total
                )
                * 100,
                1,
            )

        weekday_data = data[:5]

        if weekday_data:
            peak_value = max(item.total for item in weekday_data)

            if peak_value > 0:
                for item in weekday_data:
                    if item.total == peak_value:
                        item.is_peak_day = True
                        break

        return WeeklyRevenueResponse(
            total=weekly_total,
            change=change,
            data=data,
        )

    async def get_patient_appointments_statistics(
            self,
            patient_id: int,
    ) -> PatientAppointmentsResponse:
        total = await self.repository.get_patient_appointments_count(
            patient_id=patient_id,
        )

        return PatientAppointmentsResponse(
            total=total,
        )

    async def get_patient_no_shows_statistics(
            self,
            patient_id: int,
    ) -> PatientNoShowsResponse:
        total = await self.repository.get_patient_no_shows_count(
            patient_id=patient_id,
        )

        return PatientNoShowsResponse(
            total=total,
        )

    async def get_patient_hygiene_statistics(
            self,
            patient_id: int,
    ) -> PatientHygieneResponse:
        last_hygiene_visit = (
            await self.repository.get_patient_last_hygiene_appointment(
                patient_id=patient_id,
            )
        )

        if last_hygiene_visit is None:
            return PatientHygieneResponse(
                status="no_history",
                last_hygiene_visit=None,
                months_since_last_visit=None,
            )

        now = datetime.now(timezone.utc)

        overdue_date = last_hygiene_visit + relativedelta(months=6)

        months_since_last_visit = (
                (now.year - last_hygiene_visit.year) * 12
                + now.month
                - last_hygiene_visit.month
        )

        status = (
            "overdue"
            if now >= overdue_date
            else "up_to_date"
        )

        return PatientHygieneResponse(
            status=status,
            last_hygiene_visit=last_hygiene_visit,
            months_since_last_visit=months_since_last_visit,
        )

    async def get_total_patients_statistics(
            self,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        current_month_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        current_month_start = current_month_start_local.astimezone(
            timezone.utc,
        )

        total = await self.repository.get_total_patients_count()

        previous_total = await self.repository.get_patients_count_before(
            before_date=current_month_start,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_new_patients_statistics(
            self,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        current_month_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        tomorrow_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        ) + timedelta(days=1)

        if now_local.month == 1:
            previous_year = now_local.year - 1
            previous_month = 12
        else:
            previous_year = now_local.year
            previous_month = now_local.month - 1

        previous_month_start_local = datetime(
            year=previous_year,
            month=previous_month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        last_day_of_previous_month = calendar.monthrange(
            previous_year,
            previous_month,
        )[1]

        previous_day = min(
            now_local.day,
            last_day_of_previous_month,
        )

        previous_period_end_local = datetime(
            year=previous_year,
            month=previous_month,
            day=previous_day,
            tzinfo=CLINIC_TIMEZONE,
        ) + timedelta(days=1)

        current_month_start = current_month_start_local.astimezone(
            timezone.utc,
        )
        tomorrow_start = tomorrow_start_local.astimezone(
            timezone.utc,
        )
        previous_month_start = previous_month_start_local.astimezone(
            timezone.utc,
        )
        previous_period_end = previous_period_end_local.astimezone(
            timezone.utc,
        )

        total = await self.repository.get_new_patients_count(
            start_date=current_month_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_new_patients_count(
            start_date=previous_month_start,
            end_date=previous_period_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_returning_patients_statistics(
            self,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        current_month_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        tomorrow_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        ) + timedelta(days=1)

        if now_local.month == 1:
            previous_year = now_local.year - 1
            previous_month = 12
        else:
            previous_year = now_local.year
            previous_month = now_local.month - 1

        previous_month_start_local = datetime(
            year=previous_year,
            month=previous_month,
            day=1,
            tzinfo=CLINIC_TIMEZONE,
        )

        last_day_of_previous_month = calendar.monthrange(
            previous_year,
            previous_month,
        )[1]

        previous_day = min(
            now_local.day,
            last_day_of_previous_month,
        )

        previous_period_end_local = datetime(
            year=previous_year,
            month=previous_month,
            day=previous_day,
            tzinfo=CLINIC_TIMEZONE,
        ) + timedelta(days=1)

        current_month_start = current_month_start_local.astimezone(
            timezone.utc,
        )
        tomorrow_start = tomorrow_start_local.astimezone(
            timezone.utc,
        )
        previous_month_start = previous_month_start_local.astimezone(
            timezone.utc,
        )
        previous_period_end = previous_period_end_local.astimezone(
            timezone.utc,
        )

        total = await self.repository.get_returning_patients_count(
            start_date=current_month_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_returning_patients_count(
            start_date=previous_month_start,
            end_date=previous_period_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_inactive_patients_statistics(
            self,
    ) -> StatisticCardResponse:
        now = datetime.now(timezone.utc)

        current_threshold = now - relativedelta(months=6)

        previous_reference_date = now - relativedelta(months=1)
        previous_threshold = previous_reference_date - relativedelta(months=6)

        total = await self.repository.get_inactive_patients_count(
            before_date=current_threshold,
        )

        previous_total = await self.repository.get_inactive_patients_count(
            before_date=previous_threshold,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_doctor_patients_today_statistics(
            self,
            doctor_id: int,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_doctor_expected_patients_count(
            doctor_id=doctor_id,
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_doctor_expected_patients_count(
            doctor_id=doctor_id,
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_doctor_completed_visits_statistics(
            self,
            doctor_id: int,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_doctor_completed_visits_count(
            doctor_id=doctor_id,
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_doctor_completed_visits_count(
            doctor_id=doctor_id,
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_doctor_cancelled_visits_statistics(
            self,
            doctor_id: int,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_doctor_cancelled_visits_count(
            doctor_id=doctor_id,
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_doctor_cancelled_visits_count(
            doctor_id=doctor_id,
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_doctor_no_show_visits_statistics(
            self,
            doctor_id: int,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        previous_day_start_local = today_start_local - timedelta(days=7)
        previous_day_end_local = tomorrow_start_local - timedelta(days=7)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        previous_day_start = previous_day_start_local.astimezone(timezone.utc)
        previous_day_end = previous_day_end_local.astimezone(timezone.utc)

        total = await self.repository.get_doctor_no_show_visits_count(
            doctor_id=doctor_id,
            start_date=today_start,
            end_date=tomorrow_start,
        )

        previous_total = await self.repository.get_doctor_no_show_visits_count(
            doctor_id=doctor_id,
            start_date=previous_day_start,
            end_date=previous_day_end,
        )

        if previous_total == 0:
            change = 0.0 if total == 0 else None
        else:
            change = round(
                ((total - previous_total) / previous_total) * 100,
                1,
            )

        return StatisticCardResponse(
            total=total,
            change=change,
        )

    async def get_doctor_daily_appointments_statistics(
            self,
            doctor_id: int,
    ) -> StatisticCardResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        total = await self.repository.get_daily_appointments_count(
            start_date=today_start,
            end_date=tomorrow_start,
            doctor_id=doctor_id,
        )

        return StatisticCardResponse(
            total=total,
            change=None,
        )

    async def get_doctor_daily_revenue_statistics(
            self,
            doctor_id: int,
    ) -> DailyRevenueResponse:
        now_local = datetime.now(CLINIC_TIMEZONE)

        today_start_local = datetime(
            year=now_local.year,
            month=now_local.month,
            day=now_local.day,
            tzinfo=CLINIC_TIMEZONE,
        )
        tomorrow_start_local = today_start_local + timedelta(days=1)

        today_start = today_start_local.astimezone(timezone.utc)
        tomorrow_start = tomorrow_start_local.astimezone(timezone.utc)

        total = await self.repository.get_daily_revenue(
            start_date=today_start,
            end_date=tomorrow_start,
            doctor_id=doctor_id,
        )

        return DailyRevenueResponse(
            total=total,
            change=None,
        )

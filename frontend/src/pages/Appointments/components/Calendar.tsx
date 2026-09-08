import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";

import {
  DateCalendar,
  DatePicker,
  type PickersCalendarHeaderProps,
} from "@mui/x-date-pickers";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import {
  PickerDay,
  type PickerDayProps,
} from "@mui/x-date-pickers/PickerDay";

import {
  setDate,
  setQuery,
} from "@/features/appointments/appointmentsSlice";

import {
  useAppDispatch,
  useAppSelector,
} from "@/app/store/hook";

/* =========================================================
   TYPES
========================================================= */

type CalendarProps = {
  /*
   * IMPORTANT:
   * Optional on purpose.
   *
   * If availableDays are passed -> appointment mode.
   * If they are not passed -> normal date picker mode.
   */
  availableDays?: number[];
  bookedDays?: number[];
  error?: string;
  selectedDate: string | null;

  variant?: "calendar" | "picker";

  onDateChange?: (date: string | null) => void;
  onMonthChange?: (date: Dayjs) => void;
};

/* =========================================================
   DAY
========================================================= */

function createServerDay(
  availableDays: number[],
  bookedDays: number[],
  backendMonth: number,
  backendYear: number,
) {
  return function ServerDay({
    day,
    sx,
    ...other
  }: PickerDayProps) {
    const dayNumber = day.date();

    const isBackendMonth =
      day.month() + 1 === backendMonth &&
      day.year() === backendYear;

    const isAvailable =
      isBackendMonth &&
      availableDays.includes(dayNumber);

    const isBooked =
      isBackendMonth &&
      bookedDays.includes(dayNumber);

    const isPast = day.isBefore(dayjs(), "day");

    return (
      <PickerDay
        {...other}
        day={day}
        sx={[
          {
            fontWeight: 500,
            borderRadius: "8px",

            /* =================================================
               AVAILABLE
            ================================================= */

            ...(isAvailable && {
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
            }),

            /* =================================================
               FULLY BOOKED
            ================================================= */

            ...(isBooked && {
              backgroundColor: "#FEE2E2",
              color: "#9CA3AF",
            }),

            /* =================================================
               PAST
            ================================================= */

            ...(isPast && {
              backgroundColor: "#FFFFFF",
              color: "#9CA3AF",
            }),

            /* =================================================
               TODAY
            ================================================= */

            "&.MuiPickerDay-today": {
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
            },

            /* =================================================
               SELECTED
            ================================================= */

            "&.Mui-selected": {
              backgroundColor: "#FFFFFF",
              color: "#2563EB",
              border: "2px solid #2563EB",
            },

            /* =================================================
               SELECTED HOVER
            ================================================= */

            "&.Mui-selected:hover": {
              backgroundColor: "#FFFFFF",
              border: "2px solid #2563EB",
            },
          },

          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  };
}

/* =========================================================
   HEADER
========================================================= */

function CustomCalendarHeader(
  props: PickersCalendarHeaderProps,
) {
  const {
    currentMonth,
    onMonthChange,
  } = props;

  const previousMonth =
    currentMonth.subtract(1, "month");

  const nextMonth =
    currentMonth.add(1, "month");

  return (
    <div className="mb-[16px] flex h-[36px] w-full items-center justify-between">
      <button
        type="button"
        onClick={() =>
          onMonthChange(previousMonth)
        }
        className="flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[28px] leading-none"
        aria-label="Previous month"
      >
        ‹
      </button>

      <div className="font-medium capitalize text-[16px] text-[#1F2937]">
        {currentMonth.format("MMMM YYYY")}
      </div>

      <button
        type="button"
        onClick={() =>
          onMonthChange(nextMonth)
        }
        className="flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[28px] leading-none"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}

/* =========================================================
   CALENDAR
========================================================= */

export default function Calendar({
  error,
  availableDays,
  bookedDays,
  selectedDate,
  variant = "calendar",
  onDateChange,
  onMonthChange,
}: CalendarProps) {
  const dispatch = useAppDispatch();

  const {
    currentMonth,
    currentYears,
    query,
  } = useAppSelector(
    (state) => state.appointment.calendar,
  );

  /*
   * =======================================================
   * MODE
   * =======================================================
   *
   * availableDays !== undefined means that this Calendar
   * is connected to Appointment availability.
   *
   * availableDays === undefined means ordinary form usage.
   *
   * IMPORTANT:
   * [] is still appointment mode.
   * This is important because backend can legitimately
   * return an empty array.
   */

  const isAppointmentMode =
    availableDays !== undefined;

  const safeAvailableDays =
    availableDays ?? [];

  const safeBookedDays =
    bookedDays ?? [];

  /* =======================================================
     SELECTED DATE
  ======================================================= */

  const value = useMemo(() => {
    if (!selectedDate) {
      return null;
    }

    const parsedDate = dayjs(selectedDate);

    return parsedDate.isValid()
      ? parsedDate
      : null;
  }, [selectedDate]);

  /* =======================================================
     SERVER DAY
  ======================================================= */

  const ServerDay = useMemo(() => {
    /*
     * Normal picker does NOT need ServerDay.
     *
     * MUI will use its default PickerDay.
     */

    if (!isAppointmentMode) {
      return undefined;
    }

    return createServerDay(
      safeAvailableDays,
      safeBookedDays,
      currentMonth,
      currentYears,
    );
  }, [
    isAppointmentMode,
    safeAvailableDays,
    safeBookedDays,
    currentMonth,
    currentYears,
  ]);

  /* =======================================================
     MONTH CHANGE
  ======================================================= */

  const handleMonthChange = (date: Dayjs) => {
    /*
     * =====================================================
     * NORMAL FORM
     * =====================================================
     *
     * Do NOT touch appointment Redux.
     *
     * MUI can change the displayed month itself.
     * We only notify parent if parent needs it.
     */

    if (!isAppointmentMode) {
      onMonthChange?.(date);
      return;
    }

    /*
     * =====================================================
     * APPOINTMENT
     * =====================================================
     *
     * Original logic stays here.
     */

    const month = date.month() + 1;
    const year = date.year();

    if (
      month === query.month &&
      year === query.year
    ) {
      return;
    }

    if (
      month === currentMonth &&
      year === currentYears &&
      (
        query.month !== currentMonth ||
        query.year !== currentYears
      )
    ) {
      return;
    }

    dispatch(
      setQuery({
        month,
        year,
      }),
    );

    onMonthChange?.(date);
  };

  /* =======================================================
     DATE CHANGE
  ======================================================= */

  const handleDateChange = (
    date: Dayjs | null,
  ) => {
    const formattedDate = date
      ? date.format("YYYY-MM-DD")
      : null;

    /*
     * IMPORTANT:
     *
     * Only Appointment calendar changes
     * appointment Redux state.
     *
     * Normal form only gets onDateChange().
     */

    if (isAppointmentMode) {
      dispatch(
        setDate(formattedDate),
      );
    }

    onDateChange?.(formattedDate);
  };

  /* =======================================================
     DISABLE DATE
  ======================================================= */

  const shouldDisableDate = (
    day: Dayjs,
  ) => {
    /*
     * Normal form:
     * absolutely nothing is disabled.
     */

    if (!isAppointmentMode) {
      return false;
    }

    /*
     * Appointment:
     * original availability logic.
     */

    const isBackendMonth =
      day.month() + 1 === currentMonth &&
      day.year() === currentYears;

    if (!isBackendMonth) {
      return true;
    }

    return !safeAvailableDays.includes(
      day.date(),
    );
  };

  /* =======================================================
     COMMON PROPS
  ======================================================= */

  const commonProps = {
    value,

    onChange: handleDateChange,

    /*
     * In normal mode this only calls parent's callback.
     *
     * In appointment mode it also updates Redux.
     */
    onMonthChange: handleMonthChange,

    /*
     * Normal mode -> always false.
     * Appointment mode -> availableDays logic.
     */
    shouldDisableDate,

    slots: {
      /*
       * Only appointment calendar gets ServerDay.
       *
       * Normal DatePicker gets MUI default day.
       */
      ...(ServerDay
        ? { day: ServerDay }
        : {}),

      calendarHeader:
        CustomCalendarHeader,
    },
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
    >
      {variant === "calendar" ? (
        /* ===================================================
           APPOINTMENT MAIN CALENDAR
        =================================================== */

        <div
          className={`flex h-[389px] w-[348px] rounded-[8px] border bg-white p-[20px] shadow-sm ${
            selectedDate
              ? "border-gray-200"
              : "border-red-500"
          }`}
        >
          <DateCalendar
            {...commonProps}
            views={["day"]}
            openTo="day"
            showDaysOutsideCurrentMonth
            fixedWeekNumber={6}
            dayOfWeekFormatter={(date) =>
              date.format("dd")
            }
            sx={{
              "& .MuiDayCalendar-root": {
                width: "300px",
                height: "340px",
                padding: 0,
                margin: 0,
                overflow: "hidden",
              },

              "& .MuiDayCalendar-header": {
                width: "300px",
                height: "36px",
                margin: 0,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                color: "#6B7280",
              },

              "& .MuiDayCalendar-weekContainer": {
                width: "300px",
                fontWeight: 500,
                marginBottom: "8px",
                justifyContent:
                  "space-between",

                "&:last-child": {
                  marginBottom: 0,
                },
              },

              "& .MuiDayCalendar-slideTransition": {
                height: "280px",
                overflow: "hidden",
              },

              "& .MuiDayCalendar-monthContainer": {
                height: "280px",
                overflow: "hidden",
              },

              "& .MuiDayCalendar-weekDayLabel": {
                fontFamily:
                  "Inter, sans-serif",
                fontWeight: 500,
                height: "36px",
                fontSize: "14px",
                marginBottom: "8px",
              },

              "& .MuiPickersDay-root": {
                fontSize: "14px",
              },
            }}
          />
        </div>
      ) : (
        /* ===================================================
           PICKER
           
           Works both:
           
           1. Appointment form
              availableDays passed
           
           2. Normal form
              availableDays NOT passed
        =================================================== */

        <div className="w-1/2">
          <label className="mb-[10px] block font-[Inter] font-medium text-[14px]">
            Date *
          </label>

          <DatePicker
              {...commonProps}
              
              showDaysOutsideCurrentMonth
               
            dayOfWeekFormatter={(date) =>
              date.format("dd")
            }
            fixedWeekNumber={6}
            format="DD.MM.YYYY"
            slotProps={{
               textField: {
      fullWidth: true,
      error: !!error,
      helperText: error,

                sx: {
                  "& .MuiPickersInputBase-root": {
                    height: "44px",
                    borderRadius: "8px",
                    width: "100%",
                    padding: "12px",
                  },

                  "& .MuiPickersInputBase-sectionsContainer": {
                    padding: 0,
                    flex: 1,
                  },

                  "& .MuiInputAdornment-root": {
                    marginLeft: "0px",
                  },

                  "& .MuiIconButton-root": {
                    padding: "8px",
                  },
                },
              },

              day: {
                sx: {
                  "--PickerDay-size": "28px",
                  fontSize: "14px",
                },
              },

              popper: {
                sx: {
                  "& .MuiDateCalendar-root": {
                    width: "270px",
                    height: "297px",
                    boxSizing: "border-box",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent:
                      "flex-start",
                    alignItems: "stretch",
                  },

                  "& .MuiDayCalendar-root": {
                    width: "100%",
                  },

                  "& .MuiDayCalendar-header": {
                    width: "100%",
                    height: "36px",
                    margin: 0,
                    color: "#6B7280",
                    display: "flex",
                    justifyContent:
                      "space-between",
                  },

                  "& .MuiDayCalendar-weekContainer": {
                    width: "100%",
                    height: "28px",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    margin: 0,
                    marginBottom: "4px",
                  },
                },
              },
            }}
          />
        </div>
      )}
    </LocalizationProvider>
  );
}
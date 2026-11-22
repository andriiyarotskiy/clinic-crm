import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";

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

type CalendarProps = {
  availableDays?: number[];
  bookedDays?: number[];

  selectedDate: string | null;

  displayedMonth?: Dayjs;

  error?: string;

  variant?: "calendar" | "picker";

  minDate?: Dayjs;

  onDateChange?: (date: string | null) => void;

  onMonthChange?: (date: Dayjs) => void;

  
  onClose?: () => void;
};


function createServerDay(
  availableDays: number[],
  bookedDays: number[],
  displayedMonth: Dayjs,
) {
  return function ServerDay({
    day,
    sx,
    ...other
  }: PickerDayProps) {
    const dayNumber = day.date();

    const isDisplayedMonth =
      day.month() === displayedMonth.month() &&
      day.year() === displayedMonth.year();

    const isAvailable =
      isDisplayedMonth &&
      availableDays.includes(dayNumber);

    const isBooked =
      isDisplayedMonth &&
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

            ...(isAvailable && {
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
            }),

            ...(isBooked && {
              backgroundColor: "#FEE2E2",
              color: "#9CA3AF",
            }),

            ...(isPast && {
              backgroundColor: "#FFFFFF",
              color: "#9CA3AF",
            }),

            "&.MuiPickerDay-today": {
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
            },

            "&.Mui-selected": {
              backgroundColor: "#FFFFFF",
              color: "#2563EB",
              border: "2px solid #2563EB",
            },

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
        className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center border-none text-[28px] text-[#1F2937]"
        aria-label="Previous month"
      >
        <GoChevronLeft />
      </button>

      <div className="font-medium capitalize text-[16px] text-[#1F2937]">
        {currentMonth.format("MMMM YYYY")}
      </div>

      <button
        type="button"
        onClick={() =>
          onMonthChange(nextMonth)
        }
        className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center border-none text-[28px] text-[#1F2937]"
        aria-label="Next month"
      >
        <GoChevronRight />
      </button>
    </div>
  );
}

export default function Calendar({
  error,
  availableDays,
  bookedDays,
  selectedDate,
  displayedMonth,
  variant = "calendar",
  minDate,
  onDateChange,
  onMonthChange,
  onClose,
}: CalendarProps) {
  const isAppointmentMode =
    availableDays !== undefined;

  
  const [instanceKey, setInstanceKey] = useState(0);

  const handleClose = () => {
  
    setInstanceKey((k) => k + 1);
    onClose?.();
  };

  const safeAvailableDays =
    availableDays ?? [];

  const safeBookedDays =
    bookedDays ?? [];

 
   
  const currentDisplayedMonth = useMemo(() => {
    if (displayedMonth) {
      return displayedMonth.startOf("month");
    }

    if (selectedDate) {
      const parsedDate = dayjs(selectedDate);

      if (parsedDate.isValid()) {
        return parsedDate.startOf("month");
      }
    }

    return dayjs().startOf("month");
  }, [displayedMonth, selectedDate]);

  /**
   * =========================================================
   * SELECTED VALUE
   * =========================================================
   */
  const value = useMemo(() => {
    if (!selectedDate) {
      return null;
    }

    const parsedDate = dayjs(selectedDate);

    return parsedDate.isValid()
      ? parsedDate
      : null;
  }, [selectedDate]);

  
  const ServerDay = useMemo(() => {
    if (!isAppointmentMode) {
      return undefined;
    }

    return createServerDay(
      safeAvailableDays,
      safeBookedDays,
      currentDisplayedMonth,
    );
  }, [
    isAppointmentMode,
    safeAvailableDays,
    safeBookedDays,
    currentDisplayedMonth,
  ]);

  
  const handleMonthChange = (
    date: Dayjs,
  ) => {
    const month =
      date.startOf("month");

    onMonthChange?.(month);
  };

 
  const handleDateChange = (
    date: Dayjs | null,
  ) => {
    const formattedDate = date
      ? date.format("YYYY-MM-DD")
      : null;

    onDateChange?.(formattedDate);
  };

  
  const shouldDisableDate = (
    day: Dayjs,
  ) => {
    if (!isAppointmentMode) {
      return false;
    }

    const isDisplayedMonth =
      day.month() ===
        currentDisplayedMonth.month() &&
      day.year() ===
        currentDisplayedMonth.year();

    if (!isDisplayedMonth) {
      return true;
    }

    return !safeAvailableDays.includes(
      day.date(),
    );
  };

 
  const commonProps = {
    value,

    onChange: handleDateChange,

    onMonthChange:
      handleMonthChange,

    shouldDisableDate,

    slots: {
      ...(ServerDay
        ? { day: ServerDay }
        : {}),

      calendarHeader:
        CustomCalendarHeader,
    },
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
    >
      {variant === "calendar" ? (
        <div
          className={`flex h-[389px] w-[348px] rounded-[8px] border bg-white p-[20px] shadow-sm ${
            selectedDate
              ? "border-gray-200"
              : "border-red-500"
          }`}
        >
          <DateCalendar
            {...commonProps}
            referenceDate={
              currentDisplayedMonth
            }
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
        <div className="w-1/2">
          <label className="mb-[10px] block font-[Inter] font-medium text-[14px]">
            Date *
          </label>

          <DatePicker
            key={instanceKey}
            {...commonProps}
            onClose={handleClose}
            referenceDate={
              currentDisplayedMonth
            }
            minDate={minDate}
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
                    flexDirection:
                      "column",
                    justifyContent:
                      "flex-start",
                    alignItems:
                      "stretch",
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
                    alignItems:
                      "center",
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

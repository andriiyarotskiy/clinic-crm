import { createSlice, type PayloadAction  } from "@reduxjs/toolkit";
import { getAppointmentsDashboardThunk } from "./thunk/getAppointmentsDashboardThunk";
import type { CalendarQuery } from "./model/calendarQuery";
import { getAvailableTimeSlotsThunk } from "./thunk/getAvailableSlots";
import { getTreatmentsThunk } from "./thunk/getTreatments";
import { createAppointmentThunk } from "./thunk/createAppointmentThunk";
import { getAppointmentsThunk } from "./thunk/getAppointmentsThunk";
import type { Appointment } from "@/types/appointment";
import type { AppointmentsQuery } from "./model/appointmentQuery";
import type { Doctor } from "@/types/doctor";
import type { AvailableTimeSlot } from "./model/avalibleTimeSlots";
import type { Treatment } from "@/types/treatment";
import { getAppointmentByIdThunk } from "./thunk/getAppointmentByIdThunk";
import { getFormAppointmentsDashboardThunk } from "./thunk/getFormAppointmentsDashboardThunk";
import { getFormAvailableTimeSlotsThunk } from "./thunk/getFormAvailableTimeSlotsThunk";
interface CalendarState {
  fullyBookedTimeCount: number;
  availableTimeCount: number;
  availableDays: number[];
  currentYears: number;
  currentMonth: number;
  dayInMonth: number;
  fullyBookedDays: number[];
  availableTime: AvailableTimeSlot[];
  selectedDate: string | null;
  selectedSpecialization: string | null;
  selectedDoctor: Doctor | null;
  selectedSlotsTime: null | string;
  selectedTreatment: null | string;
  query: CalendarQuery;
  calendarLoading: boolean;
}
interface FormCalendarState {
  availableDays: number[];
  fullyBookedDays: number[];
  availableTime: AvailableTimeSlot[];

  fullyBookedTimeCount: number;
  availableTimeCount: number;

  calendarLoading: boolean;
}
interface AppointmentsState {
  appointmentsQuery: AppointmentsQuery;

  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  activeAppointmentForVisit: Appointment | null;
  page: number;
  pageSize: number;
  pages: number;
  total: number;

  treatments: Treatment[];
  statistic: string[];

  calendar: CalendarState;
formCalendar: FormCalendarState;
  appointmentsLoading: boolean;
}

const initialState: AppointmentsState = {
  appointmentsQuery: {
    search: "",
    doctorId: null,
    patientId: null,
    appointmentStatus: null,
    dateFrom: null,
    dateTo: null,
    page: 1,
    pageSize: 5,
  },

  appointments: [],
  selectedAppointment: null,
  activeAppointmentForVisit: null,

  page: 1,
  pageSize: 5,
  pages: 0,
  total: 0,

  treatments: [],
  statistic: [],

  appointmentsLoading: false,

  calendar: {
     currentMonth: new Date().getMonth() + 1,
  currentYears: new Date().getFullYear(),
    dayInMonth:0,
    availableDays: [],
    fullyBookedDays: [],
    availableTime: [],
    fullyBookedTimeCount: 0,
    availableTimeCount: 0,

    selectedDate: null,
    selectedDoctor: null,
    selectedSpecialization: null,
    selectedSlotsTime: null,
    selectedTreatment: null,

    query: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },

    calendarLoading: false,
  },
  formCalendar: {
  availableDays: [],
  fullyBookedDays: [],
  availableTime: [],
  fullyBookedTimeCount: 0,
  availableTimeCount: 0,
  calendarLoading: false,
},
};

const appointmentsSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setAppointmentsQuery(
      state,
      action: PayloadAction<Partial<AppointmentsQuery>>,
    ) {
      state.appointmentsQuery = {
        ...state.appointmentsQuery,
        ...action.payload,
      };
    },
    resetAppointmentsQuery(state) {
      state.appointmentsQuery = initialState.appointmentsQuery;
    },

    setQuery(state, action: PayloadAction<Partial<CalendarQuery>>) {
    

  
      state.calendar.query = {
        
        ...state.calendar.query,
        ...action.payload,
      
      };
    },
    resetQuery(state) {
      state.calendar.query = initialState.calendar.query;
    },
    resetCalendarQuery(state) {
      state.calendar = initialState.calendar
    },
    setSelectedAppointment(state, action) {
      state.selectedAppointment = action.payload;
    },
    setSelectedActiveAppointmentForVisit(state, action) {
      state.activeAppointmentForVisit = action.payload;
    },
    setDate(state, action) {
      state.calendar.selectedDate = action.payload;
     
    },
    setSpecialization(state, action) {
      state.calendar.selectedSpecialization = action.payload;
      state.calendar.selectedDoctor = null;
      state.calendar.availableTime = [];
    },
    setDoctor(state, action) {
      state.calendar.selectedDoctor = action.payload;
    },
    setTime(state, action) {
      state.calendar.selectedSlotsTime = action.payload;
      
    },
    setTreatment(state, action) {
      state.calendar.selectedTreatment = action.payload;
    },
    resetFormCalendar(state) {
  state.formCalendar = initialState.formCalendar;
},
    resetAppointmentsState() {
  return initialState;
},
  },
  extraReducers: (builder) => {
    builder
     .addCase(getAppointmentsDashboardThunk.pending, (state) => {
  state.calendar.calendarLoading = true;

  state.calendar.availableDays = [];
  state.calendar.fullyBookedDays = [];
})
      .addCase(getAppointmentsDashboardThunk.fulfilled, (state, action) => {
        state.calendar.availableDays = action.payload.calendar.availableDays;
        state.calendar.fullyBookedDays = action.payload.calendar.fullyBookedDays;
        state.calendar.currentMonth = action.payload.calendar.month;
        state.calendar.currentYears = action.payload.calendar.year;
        state.calendar.dayInMonth = action.payload.calendar.dayInMonth;
        state.statistic = action.payload.statistic;
        state.calendar.calendarLoading = false;
        console.log("забукані дні", action.payload);
      })
      .addCase(getAppointmentsDashboardThunk.rejected, (state) => {
        state.calendar.calendarLoading = false;
      })
      .addCase(getAvailableTimeSlotsThunk.pending, (state) => {
        state.calendar.calendarLoading = true;
        state.calendar.availableTime = [];
      })
      .addCase(getAvailableTimeSlotsThunk.fulfilled, (state, action) => {
        state.calendar.availableTimeCount = action.payload.availableCount;
        state.calendar.fullyBookedTimeCount = action.payload.bookedCount;
        state.calendar.availableTime = action.payload.slots;
        state.calendar.calendarLoading = false;
      })
      .addCase(getAvailableTimeSlotsThunk.rejected, (state) => {
        state.calendar.calendarLoading = false;
      })
      .addCase(getFormAvailableTimeSlotsThunk.pending, (state) => {
  state.formCalendar.calendarLoading = true;
 
})
.addCase(getFormAvailableTimeSlotsThunk.fulfilled, (state, action) => {
  state.formCalendar.availableTimeCount =
    action.payload.availableCount;

  state.formCalendar.fullyBookedTimeCount =
    action.payload.bookedCount;

  state.formCalendar.availableTime =
    action.payload.slots;

  state.formCalendar.calendarLoading = false;
})
.addCase(getFormAvailableTimeSlotsThunk.rejected, (state) => {
  state.formCalendar.calendarLoading = false;
})
      .addCase(getFormAppointmentsDashboardThunk.pending, (state) => {
  state.formCalendar.calendarLoading = true;

  state.formCalendar.availableDays = [];
  state.formCalendar.fullyBookedDays = [];
})
.addCase(getFormAppointmentsDashboardThunk.fulfilled, (state, action) => {
  state.formCalendar.availableDays =
    action.payload.calendar.availableDays;

  state.formCalendar.fullyBookedDays =
    action.payload.calendar.fullyBookedDays;

  state.formCalendar.calendarLoading = false;
})
.addCase(getFormAppointmentsDashboardThunk.rejected, (state) => {
  state.formCalendar.calendarLoading = false;
})
      .addCase(getTreatmentsThunk.pending, () => {
     
      })
      .addCase(getTreatmentsThunk.fulfilled, (state, action) => {
        state.treatments = action.payload;
      })
      .addCase(getTreatmentsThunk.rejected, () => {
       
      })
      .addCase(createAppointmentThunk.pending, (state) => {
        state.appointmentsLoading = true;
      })
      .addCase(createAppointmentThunk.fulfilled, (state) => {
        state.appointmentsLoading = false;
      })
      .addCase(createAppointmentThunk.rejected, (staet) => {
        staet.appointmentsLoading = false;
      })
      .addCase(getAppointmentsThunk.pending, (state) => {
        state.appointmentsLoading = true;
      })
      .addCase(getAppointmentsThunk.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload.items;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.pages = action.payload.pages;
        state.total = action.payload.total;

        console.log("current information", action.payload);
      })
      .addCase(getAppointmentsThunk.rejected, (state) => {
        state.appointmentsLoading = false;
      })
      .addCase(getAppointmentByIdThunk.pending, (state => {
        state.appointmentsLoading = true
      }))
    .addCase(getAppointmentByIdThunk.fulfilled, (state, action) => {
      state.appointmentsLoading = false;
      state.selectedAppointment = action.payload;
    })
     .addCase(getAppointmentByIdThunk.rejected, (state => {
       state.appointmentsLoading = false;
     }))
    
    
  },
});
export const {
  setAppointmentsQuery,
  resetAppointmentsQuery,
  resetCalendarQuery,
  setTime,
  setQuery,
  resetQuery,
  setSpecialization,
  setSelectedAppointment,
  setSelectedActiveAppointmentForVisit,
  setDate,
  setDoctor,
  setTreatment,
  resetAppointmentsState, resetFormCalendar

} = appointmentsSlice.actions;
export default appointmentsSlice.reducer;

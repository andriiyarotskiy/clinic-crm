import { createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentsService } from "@/services/appointmentsService";
import { getErrorMessage } from "@/features/errors/getError";
import type { CalendarQuery } from "../model/calendarQuery";

export const getFormAppointmentsDashboardThunk = createAsyncThunk(
  "appointments/formDashboard",
  async (query: CalendarQuery, thunkApi) => {
    try {
      return await appointmentsService.getAppointmentsDashboard(query);
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  },
);
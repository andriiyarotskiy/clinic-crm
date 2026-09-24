import { createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentsService } from "@/services/appointmentsService";
import { getErrorMessage } from "@/features/errors/getError";
import type { AvailableTimeSlotsQuery } from "../model/availableTimeSlotsQuery";

export const getFormAvailableTimeSlotsThunk = createAsyncThunk(
  "appointments/formAvailableTime",
  async (query: AvailableTimeSlotsQuery, thunkApi) => {
    try {
      return await appointmentsService.getAvailableAppointmentsTime(query);
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  },
);
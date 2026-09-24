import { getErrorMessage } from "@/features/errors/getError";
import { appointmentsService } from "@/services/appointmentsService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppointmentsQuery } from "../model/appointmentQuery";

export const getAppointmentsThunk = createAsyncThunk(
  "get/appointments",
  async (query:AppointmentsQuery, thunkApi) => {
    try {
      return await appointmentsService.getAppointments(query)
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
  }
)
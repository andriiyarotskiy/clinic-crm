import { getErrorMessage } from "@/features/errors/getError";
import { appointmentsService } from "@/services/appointmentsService";
import type { AppointmentFormData } from "@/types/appointmentFormData";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createAppointmentThunk = createAsyncThunk(
  "appointments/create",
  async (data:AppointmentFormData, thunkApi) => {
    try {
      
    return   await appointmentsService.createAppointments(data)
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
  }
)
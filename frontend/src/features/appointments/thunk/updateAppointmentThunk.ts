import { getErrorMessage } from "@/features/errors/getError";
import { appointmentsService } from "@/services/appointmentsService";
import { createAsyncThunk } from "@reduxjs/toolkit";


export type UpdateAppointmentPayload = {
  id: number;
  patientId: number;
  doctorId: number;
  treatmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: string;
  notes?: string;
};

export const updateAppointmentThunk = createAsyncThunk(
  "appointments/update",
  async (data: UpdateAppointmentPayload, thunkApi) => {
    try {
      return await appointmentsService.updateAppointment(data);
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  },
);

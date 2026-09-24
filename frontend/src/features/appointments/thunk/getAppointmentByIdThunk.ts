import { getErrorMessage } from "@/features/errors/getError";
import { appointmentsService } from "@/services/appointmentsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAppointmentByIdThunk = createAsyncThunk(
  'getAppointmentByIs',
  async (id:string, thunkApi) => {
    try {
     return await appointmentsService.getAppointmentsByID(id)
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
    
  }
)
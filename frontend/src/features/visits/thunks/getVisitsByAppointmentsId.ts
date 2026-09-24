import { getErrorMessage } from "@/features/errors/getError";
import { visitsService } from "@/services/visitsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getVisitByAppointmentIdThunk = createAsyncThunk(
  'getVisitsByAppointmentId',
  async (appointmentId:number, thunkApi) => {
    try{return await visitsService.getVisitByAppointmentId(appointmentId)}
  
     catch (e) {
    return thunkApi.rejectWithValue(getErrorMessage(e))
  }
  }
 
)
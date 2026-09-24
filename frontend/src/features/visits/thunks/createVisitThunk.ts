import { getErrorMessage } from "@/features/errors/getError";
import { visitsService } from "@/services/visitsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createVisitThunk = createAsyncThunk(
  "visit/create",
  async (appointmentId:number, thunkApi) => {
    try {
      return await visitsService.createVisit(appointmentId)
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
  }
)
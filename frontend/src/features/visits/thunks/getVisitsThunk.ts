import { getErrorMessage } from "@/features/errors/getError";
import { visitsService } from "@/services/visitsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getVisits = createAsyncThunk(
  "getAllVisits",
  async (_, thunkApi) => {
    try{
      return await visitsService.getVisits()
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
  }
)
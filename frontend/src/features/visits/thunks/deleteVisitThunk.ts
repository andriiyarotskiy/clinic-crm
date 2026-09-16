import { getErrorMessage } from "@/features/errors/getError";
import { visitsService } from "@/services/visitsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const deleteVisitThunk = createAsyncThunk(
  "delete/Visit",
  async (id:number, thunkApi) =>  {
    try {
      await visitsService.deleteVisits(id)
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
  }
)
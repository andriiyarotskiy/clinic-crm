import { getErrorMessage } from "@/features/errors/getError";
import { visitsService } from "@/services/visitsService";
import { createAsyncThunk } from "@reduxjs/toolkit";
export interface UpdatePatientNotePayload {
  treatmentAdd1: string | null;
  treatmentAdd2: string | null;
  diagnosis: string | null;
  description: string | null;
  recommendation: string | null;
}

export const updatePatientNoteThunk = createAsyncThunk(
  "visits/updatePatientNoteVisits",
  async (
    {
      visitId,
      data,
    }: {
      visitId: number;
      data: UpdatePatientNotePayload;
    },
    thunkApi,
  ) => {
    try {
      return await visitsService.updateVisit(
        visitId,
        data,
      );
    } catch (e) {
      return thunkApi.rejectWithValue(
        getErrorMessage(e),
      );
    }
  },
);
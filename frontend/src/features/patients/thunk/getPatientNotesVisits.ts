import { getErrorMessage } from "@/features/errors/getError";
import { patientsService } from "@/services/patientService";
import type { Visit } from "@/types/visit";
import { createAsyncThunk } from "@reduxjs/toolkit";

export interface PatientNotesQuery {
  page: number;
  pageSize: number;
}

export interface GetPatientNotesParams extends PatientNotesQuery {
  patientId: number;
}

export interface PatientNotesResponse {
  patientId: number;
  clinicalNotes: Visit[];
  total: number;
  page: number;
  pageSize: number;
  pages?: number;
}
export const getPatientNotesThunk = createAsyncThunk(
  "patients/notes",
  async (data:GetPatientNotesParams, thunkApi) => {
    try {
      return await patientsService.getPatientNotes(data)
    }
    catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e))
    }
  }
)
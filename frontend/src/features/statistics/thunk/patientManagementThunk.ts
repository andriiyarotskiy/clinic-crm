import { getErrorMessage } from "@/features/errors/getError";
import { statisticsService } from "@/services/statisticsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const patientManagementThunk = createAsyncThunk(
  'management/getStatistics',
  async (_, thunkApi) => {
    try {
      const [
        totalPatients,
        newPatients,
       returningPatients,
        inactivePatients,
        
      ] = await Promise.all([
        
        statisticsService.getPatientsTotalManagment(),
        statisticsService.getNewPatientsManagment(),
        statisticsService.getReturningPatientsManagment(),
        statisticsService.getInactivePatientsManagment(),
       

      ]);

      return {
        patientsManagmentCard: {
         totalPatients,
        newPatients,
      returningPatients,
        inactivePatients,
        },
      
      };
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  }
);
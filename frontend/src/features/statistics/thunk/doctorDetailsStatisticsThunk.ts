import { getErrorMessage } from "@/features/errors/getError";
import { statisticsService } from "@/services/statisticsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const doctorDetailsStatisticThunk = createAsyncThunk(
  "doctor/getStatistics",
  async (id: number, thunkApi) => {
    try {
      const [
        patients,
        completedVisits,
        cancelledVisits,
        noShowVisits,
        doctorWeeklyRevenue,
      ] = await Promise.all([
        statisticsService.getDoctorPatients(id),
        statisticsService.getDoctorCompletedVisits(id),
        statisticsService.getDoctorCancelledVisits(id),
        statisticsService.getDoctorNoShowVisits(id),
        statisticsService.getDoctorWeeklyRevenue(id),
      ]);

      return {
        doctorDetailsCard: {
          patients,
        completedVisits,
        cancelledVisits,
        noShowVisits,
        doctorWeeklyRevenue,
        },
      };
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  },
);
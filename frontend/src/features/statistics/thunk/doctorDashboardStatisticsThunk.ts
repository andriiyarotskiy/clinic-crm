import { getErrorMessage } from "@/features/errors/getError";
import { statisticsService } from "@/services/statisticsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const doctorDashboardStatisticThunk = createAsyncThunk(
  "doctor/getStatistics/Doctor",
  async (id: number, thunkApi) => {
    try {
      const [
        dailyAppointments,
         noShowVisits,
        completedVisits,
        dailyRevenue,
      ] = await Promise.all([
        statisticsService.getDoctorAppointments(id),
        statisticsService.getDoctorNoShowVisits(id),
        statisticsService.getDoctorCompletedVisits(id),
        statisticsService.getDoctorDailyRevenue(id),
      ]);

      return {
        doctorDashboardCard: {
          dailyAppointments,
             noShowVisits,
        completedVisits,
        dailyRevenue,
        },
      };
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  },
);
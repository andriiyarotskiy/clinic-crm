import { getErrorMessage } from "@/features/errors/getError";
import { statisticsService } from "@/services/statisticsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const dashboardStatisticsThunk = createAsyncThunk(
  'dashboard/getStatistics',
  async (_, thunkApi) => {
    try {
      const [
        patientToday,
        dailyAppointments,
        dailyRevenue,
        monthlyRevenue,
        appointmentOutcomes,
        weeklyRevenue,
      ] = await Promise.all([
        statisticsService.getPatientToday(),
        statisticsService.getDailyAppointments(),
        statisticsService.getDailyRevenue(),
        statisticsService.getMonthlyRevenue(),
        statisticsService.getAppointmentOutcomes(),
        statisticsService.getWeeklyRevenue(),
      ]);

      return {
        cards: {
          patientToday,
          dailyAppointments,
          dailyRevenue,
          monthlyRevenue,
        },
        appointmentOutcomes,
        weeklyRevenue,
      };
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  }
);

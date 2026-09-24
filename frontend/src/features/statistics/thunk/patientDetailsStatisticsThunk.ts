import { getErrorMessage } from "@/features/errors/getError";
import { statisticsService } from "@/services/statisticsService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const patientDetailsStatisticThunk = createAsyncThunk(
  "details/getStatistics",
  async (id: number, thunkApi) => {
    try {
      const [
        appointments,
        noShow,
        hygiene,
      ] = await Promise.all([
        statisticsService.getAppointmentsPatient(id),
        statisticsService.getNoShowPatient(id),
        statisticsService.getHygienePatient(id),
      ]);

      return {
        patientDetailsCard: {
          appointments: {
            total: appointments.total,
            change:0
          },
          noShow: {
            total: noShow.total,
            change:0
          },
          hygiene: {
            total: hygiene.status,
            change: hygiene.months_since_last_visit,
          },
        },
      };
    } catch (e) {
      return thunkApi.rejectWithValue(getErrorMessage(e));
    }
  },
);
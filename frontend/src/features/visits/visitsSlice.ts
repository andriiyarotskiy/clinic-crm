import type { Visit } from "@/types/visit";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createVisitThunk } from "./thunks/createVisitThunk";
import { getVisitByAppointmentIdThunk } from "./thunks/getVisitsByAppointmentsId";
import { getVisits } from "./thunks/getVisitsThunk";
import { getTreatmentsThunk } from "../appointments/thunk/getTreatments";
import type { Treatment } from "@/types/treatment";
import { updatePatientNoteThunk } from "./thunks/updateVisit";
import { deleteVisitThunk } from "./thunks/deleteVisitThunk";

interface VisitsState {
  visits: Visit[] | [];
  currentVisit: Visit | null;
  isActiveVisit: boolean;
  treatment1: Treatment[];
  treatment2: Treatment[];

  loading: boolean;
}
const initialState: VisitsState = {
  visits: [],
  currentVisit: null,
  isActiveVisit: false,
  treatment1: [],
  treatment2: [],
  loading: false,
};

const visitsSlice = createSlice({
  name: "visits",
  initialState,
  reducers: {
    setCurrentVisit: (state, action: PayloadAction<Visit | null>) => {
      state.currentVisit = action.payload;
    },
    resetActiveVisits: (state) => {
      state.isActiveVisit = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVisitThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVisitThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createVisitThunk.rejected, (state) => {
        state.isActiveVisit = false;
        state.loading = false;
      })
      .addCase(getVisitByAppointmentIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVisitByAppointmentIdThunk.fulfilled, (state, action) => {
        state.currentVisit = action.payload;
        state.isActiveVisit = true;
        state.loading = false;
      })
      .addCase(getVisitByAppointmentIdThunk.rejected, (state) => {
        state.isActiveVisit = false;
        state.loading = false;
      })

      .addCase(getVisits.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVisits.fulfilled, (state, action) => {
        state.visits = action.payload;

        state.loading = false;
      })
      .addCase(getVisits.rejected, (state) => {
        state.loading = false;
      })

      .addCase(getTreatmentsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTreatmentsThunk.fulfilled, (state, action) => {
        state.treatment2 = action.payload;
        console.log("treatmentsadditional", action.payload);
        state.loading = false;
      })
      .addCase(getTreatmentsThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updatePatientNoteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatientNoteThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePatientNoteThunk.rejected, (state) => {
        state.loading = false;
      })
     .addCase(deleteVisitThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVisitThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteVisitThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});
export const { setCurrentVisit, resetActiveVisits } = visitsSlice.actions;
export default visitsSlice.reducer;

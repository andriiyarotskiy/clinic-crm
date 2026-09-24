import type { Patient } from "@/types/patient";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createPatientThunk } from "./thunk/createPatientThunk";
import { getAllPatientThunk } from "./thunk/getAllPacientThunk";
import { getPatientByIdThunk } from "./thunk/getPatientByIdThunk";
import { updatePatientThunk } from "./thunk/updatePatientThunk";
import { removePatientThunk } from "./thunk/removePatientThunk";
import type { PatientQuery } from "./model/patientsQuery";
import { getPatientNotesThunk } from "./thunk/getPatientNotesVisits";
import type { Visit } from "@/types/visit";


export interface PatientNotesQuery {
  page: number;
  pageSize: number;
}
interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;

  patientNotes: Visit[] | null;
  patientNotesTotal: number;
  patientNotesPages: number;
  patientNotesQuery: PatientNotesQuery;

  loading: boolean;
  error: string | null;

  total: number;
  query: PatientQuery;
}
const initialState: PatientsState = {
  patients: [],
  selectedPatient: null,
  patientNotes: null,
  patientNotesTotal: 0,
  patientNotesPages: 0,

   patientNotesQuery: {
    page: 1,
    pageSize: 3,
  },
  total: 0,
  loading: false,
  error: null,
  query:{
    search: "",
     sortBy: "name",
    sortOrder: "asc",
    page: 1,
    pageSize: 5,   
  },
  
}

const patientsSlice = createSlice({
  name: "patient",
  initialState,
 reducers: {
    setQuery(state, action: PayloadAction<Partial<PatientQuery>>) {
      state.query = {
        ...state.query,
        ...action.payload,
      };
    },

    resetQuery(state) {
      state.query = initialState.query;
    },

    setSelectedPatient(state, action: PayloadAction<Patient | null>) {
      state.selectedPatient = action.payload;
   },
     setPatientNotesQuery(
      state,
      action: PayloadAction<Partial<PatientNotesQuery>>,
    ) {
      state.patientNotesQuery = {
        ...state.patientNotesQuery,
        ...action.payload,
      };
    },

    resetPatientNotesQuery(state) {
      state.patientNotesQuery = initialState.patientNotesQuery;
    },
  },
  
  extraReducers: (builder) => {
    builder
         
      .addCase(createPatientThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPatientThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createPatientThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'failed to create patient'
      })
      .addCase(getAllPatientThunk.pending, (state) => {
         state.loading = true;
  state.patients = [];
      })
      .addCase(getAllPatientThunk.fulfilled, (state, action) => {
        
        state.loading = false;
        state.patients = action.payload.items
        state.total = action.payload.total
        
        
        
      })
      .addCase(getAllPatientThunk.rejected, (state) => {
        state.loading = false;
        state.patients = [];
      })
      .addCase(getPatientByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatient = action.payload;
        
      })
      .addCase(getPatientByIdThunk.rejected, (state) => {
  state.loading = false
      })
    .addCase(updatePatientThunk.pending, (state) => {
            state.loading = true;
          })
          .addCase(updatePatientThunk.fulfilled, (state, action) => {
            state.loading = false;
            
            state.selectedPatient = action.payload;
          })
          .addCase(updatePatientThunk.rejected, (state) => {
            state.loading = false;
          })
          .addCase(removePatientThunk.pending, state => {
            state.loading = true;
          })
        
      .addCase(removePatientThunk.fulfilled, (state, action) => {
           state.loading = false;
    
            state.patients = state.patients.filter(
            patient => patient.id !== action.payload
      );
    
      if (state.selectedPatient?.id === action.payload) {
          state.selectedPatient = null;
      }
        })
          .addCase(removePatientThunk.rejected, state => {
            state.loading = false;
          }) 
    .addCase(getPatientNotesThunk.fulfilled, (state, action) => {
  state.loading = false;

  state.patientNotes = action.payload.clinicalNotes;
  state.patientNotesTotal = action.payload.total;

  state.patientNotesQuery.page = action.payload.page;
  state.patientNotesQuery.pageSize = action.payload.pageSize;
})
    
   
  }
   
})
export const { setQuery, resetQuery, setSelectedPatient, setPatientNotesQuery,resetPatientNotesQuery } = patientsSlice.actions;
export default patientsSlice.reducer;
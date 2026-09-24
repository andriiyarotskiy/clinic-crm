import { createSlice } from "@reduxjs/toolkit";
import { dashboardStatisticsThunk } from "./thunk/dashboardStatisticsThunk";
import {
  patientManagementThunk,

 } from "./thunk/patientManagementThunk";
import { patientDetailsStatisticThunk } from "./thunk/patientDetailsStatisticsThunk";
import { doctorDetailsStatisticThunk } from "./thunk/doctorDetailsStatisticsThunk";
import { doctorDashboardStatisticThunk } from "./thunk/doctorDashboardStatisticsThunk";

export type WeeklyRevenueDay = {
  actual: number;
  day: string;
  expected: number;
  isPeakDay: boolean;
  total: number;
};

export type WeeklyRevenueData = {
  total: number;
  change: number | null;
  data: WeeklyRevenueDay[];
};

export type AppointmentOutcomesData = {
 total: number;
    completed: number;
    noShow: number;
    cancelled: number;
}
type StatisticCard = {
  total: number  ;
  change: number ;
};


type DashboardCards = {
  patientToday: StatisticCard;
  dailyAppointments: StatisticCard;
  dailyRevenue: StatisticCard;
  monthlyRevenue: StatisticCard;
};

type PatientManagementCards = {
  totalPatients: StatisticCard;
  newPatients: StatisticCard;
  returningPatients: StatisticCard;
  inactivePatients: StatisticCard;
};
type PatientDetailsCards = {
  appointments: StatisticCard;
  noShow: StatisticCard;
  hygiene: StatisticCard;  
}
type DoctorDetailsCards = {
  patients: StatisticCard;
  completedVisits:StatisticCard,
        cancelledVisits:StatisticCard,
        noShowVisits:StatisticCard,
       
}
type DoctorDashboardCards = {
  dailyAppointments:StatisticCard,
             noShowVisits:StatisticCard,
        completedVisits:StatisticCard,
        dailyRevenue:StatisticCard,
       
}

type DashboardStatistics = {
  cards: DashboardCards | null;
  appointmentOutcomes: AppointmentOutcomesData | null;
  weeklyRevenue: WeeklyRevenueData | null;
  patientsManagmentCard: PatientManagementCards | null;
  patientDetailsCard: PatientDetailsCards | null;
  doctorDetailsCard: DoctorDetailsCards | null;
  doctorWeeklyRevenue: WeeklyRevenueData | null;
  doctorDashboardCard: DoctorDashboardCards | null;
};

type DashboardState = {
  statistics: DashboardStatistics;
  isLoading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  statistics: {
    cards: null,
    appointmentOutcomes: null,
    weeklyRevenue: null,
    patientsManagmentCard: null,
    patientDetailsCard: null,
    doctorDetailsCard: null,
    doctorWeeklyRevenue: null,
    doctorDashboardCard:null,
  },
  isLoading: false,
  error: null,
};

const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(dashboardStatisticsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(dashboardStatisticsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
       state.statistics.cards = action.payload.cards;
        state.statistics.appointmentOutcomes =
          action.payload.appointmentOutcomes;
        state.statistics.weeklyRevenue =
          action.payload.weeklyRevenue;
        
      })
      .addCase(dashboardStatisticsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(patientManagementThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(patientManagementThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics.patientsManagmentCard =action.payload.patientsManagmentCard
      })
    .addCase(patientManagementThunk.rejected, (state) => {
        state.isLoading = false;
        
    })
    .addCase(patientDetailsStatisticThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(patientDetailsStatisticThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics.patientDetailsCard = action.payload.patientDetailsCard
        console.log(action.payload.patientDetailsCard)
        
      })
    .addCase(patientDetailsStatisticThunk.rejected, (state) => {
        state.isLoading = false;
        
    })

     .addCase(doctorDetailsStatisticThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(doctorDetailsStatisticThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics.doctorDetailsCard = action.payload.doctorDetailsCard;
        state.statistics.doctorWeeklyRevenue = action.payload.doctorDetailsCard.doctorWeeklyRevenue;
        console.log(action.payload)
      })
    .addCase(doctorDetailsStatisticThunk.rejected, (state) => {
        state.isLoading = false;
        
    })
     .addCase(doctorDashboardStatisticThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(doctorDashboardStatisticThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics.doctorDashboardCard = action.payload.doctorDashboardCard;
        
        console.log(action.payload)
      })
    .addCase(doctorDashboardStatisticThunk.rejected, (state) => {
        state.isLoading = false;
        
    })

  },
});
export default statisticsSlice.reducer;

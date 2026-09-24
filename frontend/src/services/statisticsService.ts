import { httpClient } from "@/http/httpClient"

export const statisticsService = {
  getPatientToday: async () => {
    const response = await httpClient.get("statistics/patients-today")
    return response.data
  },
  getDailyAppointments: async () => {
    const response = await httpClient.get('statistics/daily-appointments')
    return response.data
  },
  getDailyRevenue: async () => {
    const response = await httpClient.get('statistics/daily-revenue')
    return response.data
  },
  getMonthlyRevenue: async () => {
    const response = await httpClient.get('statistics/monthly-revenue')
    return response.data
  },
  getAppointmentOutcomes: async () => {
    const response = await httpClient.get('statistics/appointment-outcomes')
    return response.data
  },
  getWeeklyRevenue: async () => {
  const  response = await httpClient.get('statistics/weekly-revenue')
    return response.data
  },
  getPatientsTotalManagment: async () => {
    const response = await httpClient.get('statistics/patients/total')
    return response.data
  },
  getNewPatientsManagment: async () => {
    const response = await httpClient.get('statistics/patients/new')
    return response.data
  },
  getReturningPatientsManagment: async () => {
    const response = await httpClient.get('statistics/patients/returning')
    return response.data
  },
   getInactivePatientsManagment: async () => {
    const response = await httpClient.get('statistics/patients/inactive')
    return response.data
  },
   getAppointmentsPatient: async (patientId:number)=>{
     const responce = await httpClient.get(`statistics/patients/${patientId}/appointments`)
     return responce.data
  },
   getNoShowPatient: async (patientId:number)=>{
     const responce = await httpClient.get(`statistics/patients/${patientId}/no-shows`)
     return responce.data
  },
   getHygienePatient: async (patientId:number)=>{
     const responce = await httpClient.get(`statistics/patients/${patientId}/hygiene`)
     return responce.data
  },
  getDoctorPatients: async (doctorId: number) => {
    const responce = await httpClient.get(`statistics/doctors/${doctorId}/patients-today`)
    return responce.data
  },
  getDoctorCompletedVisits: async (doctorId: number) => {
    const response = await httpClient.get(`statistics/doctors/${doctorId}/completed-visits`)
    return response.data
  },
   getDoctorCancelledVisits: async (doctorId: number) => {
    const response = await httpClient.get(`statistics/doctors/${doctorId}/cancelled-visits`)
    return response.data
  },
    getDoctorNoShowVisits: async (doctorId: number) => {
    const response = await httpClient.get(`statistics/doctors/${doctorId}/no-shows`)
    return response.data
  },
     getDoctorWeeklyRevenue: async (doctorId: number) => {
    const response = await httpClient.get(`statistics/doctors/${doctorId}/weekly-revenue`)
    return response.data
  },
       getDoctorAppointments: async (doctorId: number) => {
    const response = await httpClient.get(`statistics/doctors/${doctorId}/daily-appointments`)
    return response.data
  },
         getDoctorDailyRevenue: async (doctorId: number) => {
    const response = await httpClient.get(`statistics/doctors/${doctorId}/daily-revenue`)
    return response.data
  },
   
   
   



}
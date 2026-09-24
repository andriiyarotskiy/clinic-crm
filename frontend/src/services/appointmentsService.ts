import type { AppointmentsQuery } from "@/features/appointments/model/appointmentQuery";
import type { AvailableTimeSlotsQuery } from "@/features/appointments/model/availableTimeSlotsQuery";
import type { CalendarQuery } from "@/features/appointments/model/calendarQuery";
import { httpClient } from "@/http/httpClient"
import type { AppointmentFormData } from "@/types/appointmentFormData";
import { accessTokenService } from "./accessTokenService";
import type { UpdateAppointmentPayload } from "@/features/appointments/thunk/updateAppointmentThunk";



export const appointmentsService = {
  getAppointmentsDashboard: async (query:CalendarQuery) => {
    const params = {
      month: query.month,
      year: query.year,
    }
    if (query.month) {
      params.month = query.month;
    }
    if (query.year) {
      params.year = query.year
    }
    const response = await httpClient.get(`appointments/dashboard/`, {params})
    return response.data
  },
  getAvailableAppointmentsTime: async (query:AvailableTimeSlotsQuery) => {
    const params = {
      date: query.date,
      doctor_id:query.doctorId
    }
      if (query.date) {
      params.date = query.date;
    }
    if (query.doctorId) {
      params.doctor_id = query.doctorId
    }
    const response = await httpClient.get('appointments/available-slots/',{params})
return response.data
  },

getAppointments: async (query: AppointmentsQuery) => {
  const params: Record<string, unknown> = {
    page: query.page,
    page_size: query.pageSize,
  };

  if (query.search) {
    params.search = query.search;
  }

  if (query.doctorId) {
    params.doctor_id = query.doctorId;
  }

  if (query.patientId) {
    params.patient_id = query.patientId;
  }

  if (query.dateFrom) {
    params.date_from = query.dateFrom;
  }

  if (query.dateTo) {
    params.date_to = query.dateTo;
  }
   if (query.appointmentDate) {
    params.appointment_date = query.appointmentDate;
  }

  if (query.appointmentStatus) {
    params.appointment_status = query.appointmentStatus;
  }

  const response = await httpClient.get("/appointments", { params });

  return response.data;
  },

  getAppointmentsByID: async (id:string) => {
    const response = await httpClient.get(`/appointments/${id}`)
    return response.data
  },

  createAppointments: async (data:AppointmentFormData) => {
    const response = await httpClient.post('/appointments', data,)
    return response.data
  },
  changeStatus: async (status:string, id: number) => {
  const response = await httpClient.patch(`appointments/${id}/status`, {status},
      {
        headers: {
          Authorization: `Bearer ${accessTokenService.get()}`
        }
      })
    return response.data
  },

  getTreatments: async (query:boolean) => {
    const params = {
    is_main:query
    }
    const response = await httpClient.get('/treatments/', { params })
    return response.data
  },
  updateAppointment: async (data:UpdateAppointmentPayload) => {
    const response = await httpClient.patch(`appointments/${data.id}/`,data)
    return response.data
  }
}
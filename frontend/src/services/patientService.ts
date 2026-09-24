import { httpClient } from "@/http/httpClient";
import type { PatientFormData } from "@/types/patientFormData";
import { accessTokenService } from "./accessTokenService";
import type { PatientQuery } from "@/features/patients/model/patientsQuery";
import type { PatientNotesQuery } from "@/features/patients/patientsSlice";

import type { PatientNotesResponse } from "@/features/patients/thunk/getPatientNotesVisits";

export const patientsService = {
  createPatient: async (data: PatientFormData) => {
    const response = await httpClient.post("/patients/", data, {
      headers: {
        Authorization: `Bearer ${accessTokenService.get()}`,
      },
    });
    return response.data;
  },
  getAllPatients: async (query:PatientQuery) => {
     const params:Record<string, string | number | undefined> = {
      page: query.page,
      page_size: query.pageSize,
      sort_by: query.sortBy,
       sort_order: query.sortOrder,
      
    };
  
    if (query.search) {
      params.search = query.search;
    }
  
    
  
    const response = await httpClient.get("/patients/", {params});
    return response.data;
  },

  getPatientById: async (id: number) => {
    const response = await httpClient.get(`/patients/${id}/`, {
      headers: {
        Authorization: `Bearer ${accessTokenService.get()}`,
      },
    });
    return response.data;
  },
  deletePatient: async (id: number) => {
    const response = await httpClient.delete(`/patients/${id}/`, {
      headers: {
        Authorization: `Bearer ${accessTokenService.get()}`,
      },
    });
    return response.data;
  },

  updatePatient: async (
    data: PatientFormData, id: number
  ) => {
    const response = await httpClient.patch(`/patients/${id}`, data,
      {
        headers: {
        Authorization: `Bearer ${accessTokenService.get()}`
      }})
    return response.data
    

  },
getPatientNotes: async (data: PatientNotesQuery & { patientId: number }) => {
  const response = await httpClient.get<PatientNotesResponse>(
    `/patients/${data.patientId}/clinical-notes/`,
    {
      params: {
        page: data.page,
        page_size: data.pageSize,
      },
    },
  );

  return response.data;
},

  
};

import type { UpdatePatientNotePayload } from "@/features/visits/thunks/updateVisit"
import { httpClient } from "@/http/httpClient"

export const visitsService = {
  createVisit: async (appointmentId:number) => {
    const responce = await httpClient.post("visits", {
      appointmentId: appointmentId,
  //     treatmentAdd1: 1,
  // treatmentAdd2:1,
  // diagnosis: string,
  // description: string,
  // recommendation: string,
    })
    return responce.data
  },
 getVisitByAppointmentId: async (appointmentId: number) => {
  const response = await httpClient.get(
    `visits/by-appointment/${appointmentId}`
  );

  const { id, ...visit } = response.data;

  return {
    ...visit,
    visitId: id,
  };
},
  getVisits: async()=>{
    const responce = await httpClient.get("visits/")
    return responce.data
  },
  updateVisit: async (visitsId:number, data:UpdatePatientNotePayload) => {
    const responce = await httpClient.patch(`visits/${visitsId}`, 
 data
    )
    return responce.data
  },
  deleteVisits: async (visitsId:number) => {
    const response = await httpClient.delete(`visits/${visitsId}`)
    return response.data
  }
}
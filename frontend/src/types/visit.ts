export type Visit = { 
  
    "visitId":number,
    "appointmentId": number,
    "treatmentAdd1"?: string,
    "treatmentAdd2"?: string,
    "diagnosis"?: string,
    "description"?: string,
    "recommendation"?: string,
    "amount"?: number,
    "mainTreatment"?:string,
    "mainTreatmentPrice"?: number,
    "additionalTreatment1"?: string,
    "additionalTreatment1Price"?: string,
    "additionalTreatment2"?: string,
    "additionalTreatment2Price"?: number
  "visitDate"?: string,
  doctorFirstName: string,
doctorLastName:string,

}

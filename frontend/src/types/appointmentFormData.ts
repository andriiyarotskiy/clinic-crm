export interface AppointmentFormData {
  patientId: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  doctorId: number | string;
  treatmentId: number | string;
  appointmentDate: string;
  appointmentTime: string;
  duration: 30;
  notes?: string;
}
export type Patient = {
  firstName: string,
  lastName:string,
  gender: string,
  dateOfBirth: string,
  address: string,
  source: string,
  userId: number,
  phoneNumber: string,
  email: string,
  id: number,
  avatarUrl?: string;
  lastVisitDate?: string;
  totalVisits: number;
  treatment: string;
  status: string;
  visitsCount: number;
  completedAppointmentsCount: number;
 
}

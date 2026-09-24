import type { UserRole } from "./userRole";

export type User = {
  doctorId?: number;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phoneNumber: number,
  registrationDate?: Date,
  source?: string,
  

}
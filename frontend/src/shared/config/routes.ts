export const ROUTES = {
  LOGIN: "login",
  DASHBOARD: "dashboard",
  REMINDER: "reminder",
  PATIENT: "patients",
  DOCTORS: "doctors",
  APPOINTMENTS: "appointments",
  APPDETAILS:"appointments/:appointmentId",
  CALENDAR: "calendar",
  ACTIVATE:"accounts/activate",
  DETAILS: 'doctors/:doctorId',
  PATDETAILS: 'patients/:patientId',
 MYDOCTOR: "/my-doctor",

} as const;
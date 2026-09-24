import type { User } from "@/types/user";


export const getAccess = (user: User | null) => {
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  return {
    isAdmin,
    isDoctor,
    isSuperAdmin,

    canViewAllDoctors: isAdmin || isSuperAdmin,
    canViewAllPatients: isAdmin || isSuperAdmin,
    canViewStatistics: isAdmin || isSuperAdmin,
     canViewAllAppointments: isAdmin || isSuperAdmin,

    canCreatePatient: isAdmin || isSuperAdmin,
    canCreateDoctor: isAdmin || isSuperAdmin,
    canCreateUser: isAdmin || isSuperAdmin,

    doctorId: isDoctor ? user?.doctorId : undefined,
  };
};
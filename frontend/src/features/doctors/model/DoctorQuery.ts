import type { DoctorSortBy } from "./sortDoctorTypes";

export interface DoctorQuery {
  search?: string;
  specialization?: string;
  employmentType?: string;
  sortBy?: DoctorSortBy | null;
  sortOrder?: "asc" | "desc" | null;
  page?: number;
  pageSize?: number;
}
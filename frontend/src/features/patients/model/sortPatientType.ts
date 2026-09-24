import type { PatientQuery } from "./patientsQuery";

type PatientSortBy = NonNullable<PatientQuery["sortBy"]>;

type PatientsSortButton<T extends string = string> = {
  value: T;
  ascLabel: string;
  descLabel: string;
};

export const patientsSortButtons: PatientsSortButton<PatientSortBy>[] = [
  {
    value: "name",
    ascLabel: "Name A→Z",
    descLabel: "Name Z→A",
  },
  {
    value: "recent_visit",
    ascLabel: "Recent visit ↑",
    descLabel: "Recent visit ↓",
  },
];
export type SortOrder = "asc" | "desc";

export type SortButton<T extends string = string> = {
  value: T;
  ascLabel: string;
  descLabel: string;
};

export type SortProps<T extends string = string> = {
  userCount: number;
  className?: string;
  sortBy: T | null;
  sortOrder: SortOrder | null;
  buttons: SortButton<T>[];
  onChange: (
    sortBy: T | null,
    sortOrder: SortOrder | null,
  ) => void;
};
export type DoctorSortBy =
  | "name"
  | "specialization"
  | "created_at";


export const doctorSortButtons: SortButton<DoctorSortBy>[] = [
  {
    value: "name",
    ascLabel: "Name A→Z",
    descLabel: "Name Z→A",
  },
  {
    value: "specialization",
    ascLabel: "Specialization A→Z",
    descLabel: "Specialization Z→A",
  },
  
  {
    value: "created_at",
    ascLabel: "Oldest ↑",
    descLabel: "Newest ↓",
  },
];

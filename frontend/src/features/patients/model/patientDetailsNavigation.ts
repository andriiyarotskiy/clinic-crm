

export const getPatientDetailsNavigation = (
  appointmentsCount: number,
  visitsCount: number
) => [
  {
    label: "Patient information",
    path: ".",
    showCount: false,
  },
  {
    label: "Appointment history",
    path: "history",
    showCount: true,
    count: appointmentsCount,
  },
  {
    label: "Medical records",
    path: "records",
    showCount: true,
    count: visitsCount,
  },
];
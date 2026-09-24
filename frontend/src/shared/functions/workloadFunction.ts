export const calculateWorkload = (
  patients: number | null | undefined,
  maxPatients = 20,
) => {
  if (!patients) return 0;

  return Math.min((patients / maxPatients) * 100, 100);
};


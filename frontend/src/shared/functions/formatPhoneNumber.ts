export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("380") && digits.length === 12) {
    return `+38 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 12)}`;
  }

  return phone;
};
export type AvailableTimeSlot = {
  time: string;
  status: "free" | "booked" | "expired";
}

import type { ReactElement } from "react";
import { TfiAlert } from "react-icons/tfi";
export type StatusOptions = {
  value: string;
  label: string;
  description: string;
  color: string;
  textColor: string;
  disabled?: boolean;
  icon?: ReactElement;
  dotColor: string;
}
export const statusOptions:StatusOptions[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    description: "Appointment is booked and pending confirmation",
    color: "bg-[#DBEAFE]",
    textColor: "text-[#1E40AF]",
    dotColor: "bg-[#1E40AF]",
    disabled: true,
  },
  {
    value: "confirmed",
    label: "Confirmed",
    description: "Patient has confirmed their visit",
    color: "bg-[#DCFCE7]",
    textColor: "text-[#115E59]",
     dotColor: "bg-[#4ADE80]"
  },
  {
    value: "completed",
    label: "Completed",
    description: "Visit is done and recorded",
    color: "bg-[#E5E7EB]",
    textColor: "text-[#1F2937]",
     dotColor: "bg-[#9CA3AF]"
  },
  {
    value: "no_show",
    label: "No-show",
    description: "Patient did not arrive - slot will be booked",
    color: "bg-[#FFEDD5]",
    textColor: "text-[#C2410C]",
     dotColor: "bg-[#FB923C]"
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "Appointment cancelled by patient or clinic",
    color: "bg-[#FEE2E2]",
    icon: <TfiAlert />,
    textColor: "text-[#991B1B]",
     dotColor: "bg-[#F87171]"
  },
];
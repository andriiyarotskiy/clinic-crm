
import { PiCalendarCheckLight } from "react-icons/pi";
import { LuVault } from "react-icons/lu";
import { TbAlertOctagon } from "react-icons/tb";
import { PiStethoscope } from "react-icons/pi";
type PatientDetailsCardKey =
  | "appointments"
  | "balance"
  | "noShow"
  | "hygiene";

type Card = {
  key: PatientDetailsCardKey;
  title: string;
  icon: React.ElementType;
  iconClass: string;
  value: number;
  change: number;
   prefix?:string,
};

export const detailsPatientCardStatistics: Card[] = [
    {key: 'appointments',
      title: "APPOINTMENTS",
      value: 0,
    change: 0,
     
  
      icon:PiCalendarCheckLight,
      iconClass: "bg-blue-100 text-blue-600",
    },
    { key: 'balance',
      title: "BALANCE",
      value: 200,
      change: 5,
    prefix:'+$',
      icon: LuVault,
      iconClass: "bg-[#DCFCE7] text-[#166534]",
    },
    {key: 'noShow',
      title: "NO-SHOW",
      value: 0,
      change: 0,
     
      icon: TbAlertOctagon,
      iconClass: "bg-[#FFEDD5] text-[#9A3412]",
    },
    {key: 'hygiene',
      title: "HYGIENE",
      value: 0,
      change:0,
      
    
      icon: PiStethoscope,
      iconClass: "bg-[#FEE2E2] text-[#991B1B]",
    },
  ];
import {
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi"; 
import { LuBadgeDollarSign } from "react-icons/lu";
import { PiCalendarMinusLight } from "react-icons/pi";
type DoctorDashboardCardKey =
  | "completedVisits"
  | "dailyAppointments"
  | "dailyRevenue"
  | "noShowVisits";

type StatisticsCard = {
 key: DoctorDashboardCardKey;
  title: string;
  icon: React.ElementType;
  iconClass: string;
  value: number;
  change: number;
   prefix?:string,
};
export const doctorDashboardCards:StatisticsCard[] = [
    
    { key: 'dailyAppointments',
      title: "DAILY APPOINTMENTS",
      icon: FiCalendar,
    iconClass: "bg-green-100 text-green-600",
        value: 0,
      change:0,
  },
    {key: 'noShowVisits',
          title: "NO-SHOW",
          icon: PiCalendarMinusLight,
          iconClass: "bg-[#FEE2E2] text-[#991B1B]",
            value: 0,
      change:0,
  },
          { key: 'completedVisits',
              title: "COMPLETED VISITS", 
           
              icon:FiCheckCircle  ,
              iconClass: "bg-green-100 text-green-600",
                value: 0,
      change:0,
          },
    {key: 'dailyRevenue',
      title: "DAILY REVENUE",
     prefix:'₴',
      icon: LuBadgeDollarSign,
      iconClass: "bg-[#FFEDD5] text-[#9A3412]",
        value: 0,
      change:0,
    },
    
  ];
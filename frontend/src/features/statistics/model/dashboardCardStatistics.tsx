import {
  FiCalendar,
  FiUsers,
} from "react-icons/fi"; 
import { LuBadgeDollarSign } from "react-icons/lu";
import { IoGitCompareOutline } from "react-icons/io5";
type DashboardCardKey =
  | "patientToday"
  | "dailyAppointments"
  | "dailyRevenue"
  | "monthlyRevenue";

type StatisticsCard = {
  key: DashboardCardKey;
  title: string;
  icon: React.ElementType;
  iconClass: string;
  value: number;
  change: number;
  prefix?: string;
};
export const dashboardCards:StatisticsCard[] = [
    {key: 'patientToday',
      title: "PATIENTS TODAY",
      value: 0,
      change:0,
      
      icon: FiUsers,
      iconClass: "bg-blue-100 text-blue-600",
    },
    { key: 'dailyAppointments',
      title: "DAILY APPOINTMENTS",
      value: 0,
      change: 0,
    
      icon: FiCalendar,
      iconClass: "bg-green-100 text-green-600",
    },
    {key: 'dailyRevenue',
      title: "DAILY REVENUE",
      value: 0,
      change: 0,
     prefix:'₴',
      icon: LuBadgeDollarSign,
      iconClass: "bg-[#FFEDD5] text-[#9A3412]",
    },
    {key: 'monthlyRevenue',
      title: "MONTHLY REVENUE",
      value: 0,
      change: 0,
    prefix:"₴",
      icon: IoGitCompareOutline,
      iconClass: "bg-purple-100 text-purple-600",
    },
  ];
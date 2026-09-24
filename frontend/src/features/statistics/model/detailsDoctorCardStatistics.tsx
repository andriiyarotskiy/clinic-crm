import {  FiUsers,
} from "react-icons/fi"; 

import { PiCalendarMinusLight } from "react-icons/pi";
import { FiUserX } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
type DoctorDetailsCardKey =
  | "patients"
  | "completedVisits"
  | "cancelledVisits"
  | "noShowVisits";

type Card = {
  key: DoctorDetailsCardKey;
  title: string;
  icon: React.ElementType;
  iconClass: string;
  
   prefix?:string,
};

export const detailsDoctorCardStatistics: Card[] = [
    {key: 'patients',
      title: "PATIENTS",
     
    
     
  
      icon:FiUsers,
      iconClass: "bg-blue-100 text-blue-600",
    },
    { key: 'completedVisits',
      title: "COMPLETED VISITS",
     
    prefix:'+$',
      icon:FiCheckCircle  ,
      iconClass: "bg-green-100 text-green-600",
  },
    
    {key: 'cancelledVisits',
      title: "CANCELLED VISITS",
      
     
      icon: FiUserX,
      iconClass: "bg-orange-100 text-orange-600",
    },
    {key: 'noShowVisits',
      title: "NO-SHOW",
     
      
    
      icon: PiCalendarMinusLight,
      iconClass: "bg-[#FEE2E2] text-[#991B1B]",
    },
  ];
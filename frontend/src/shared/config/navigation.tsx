import { FiHome } from "react-icons/fi";
import { PiChatDotsLight } from "react-icons/pi";
import { FiUsers } from "react-icons/fi";
import { ROUTES } from "./routes";
import { Stethoscope } from 'lucide-react';
import { CiCalendar } from "react-icons/ci";
import { LuDock } from "react-icons/lu";
import { PiQuestionLight } from "react-icons/pi";
export const navigation = [
  {
    title: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: <FiHome strokeWidth={1} className="h-[20px] w-[20px]" />,
    roles:['admin','superadmin','doctor']
  },
  {
    title: "Reminder",
    path: ROUTES.REMINDER,
    icon: <PiChatDotsLight  className="h-[20px] w-[20px]"/>,
  },
  {
    title: "Patients",
    path: ROUTES.PATIENT,
    icon: <FiUsers strokeWidth={1} className="h-[20px] w-[20px]" />,
     roles:['admin','superadmin','doctor'],
  },
   {
    title: "My Doctor",
    path: ROUTES.MYDOCTOR,
    icon:  <Stethoscope strokeWidth={1} className="h-[20px] w-[20px] "/>,
     roles:['doctor']
  },
  {
    title: "Doctors",
    path: ROUTES.DOCTORS,
    icon: <Stethoscope strokeWidth={1} className="h-[20px] w-[20px] "/>,
     roles:['admin','superadmin']
  },
  {
    title: "Appointments",
    path: ROUTES.APPOINTMENTS,
    icon: <LuDock strokeWidth={1} className="h-[20px] w-[20px]"/>,
     roles:['admin','superadmin']
  },
  {
    title: "Calendar",
    path: ROUTES.CALENDAR,
    icon: <CiCalendar className="h-[20px] w-[20px]"/>,
     roles:['admin','superadmin']
  },
  {
    title: "About Us",
    path: ROUTES.ABOUTUS,
    icon: <PiQuestionLight strokeWidth={0.5} className="h-[20px] w-[20px]" />,
    roles:['admin','superadmin','doctor','user']
  },
];

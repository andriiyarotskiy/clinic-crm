import { PiQuestionLight } from "react-icons/pi";
import { ROUTES } from "./routes";

export const footerNavigation = [
   {
    title: "About Us",
    path: ROUTES.ABOUTUS,
    icon: <PiQuestionLight strokeWidth={0.5} className="h-[20px] w-[20px]" />,
    roles:['admin','superadmin','doctor','user']
  },
]
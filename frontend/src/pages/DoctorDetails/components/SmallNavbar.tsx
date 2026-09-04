

import { useAppSelector } from "@/app/store/hook";
import { NavLink } from "react-router-dom";

 type Navigation={
    label: string;
   path: string;
   showCount?: boolean;
   
}
type Props = {
  arrayNavigation: Navigation[]
  
 
  }

export const SmallNavbar: React.FC<Props> = ({ arrayNavigation }) => {
  
  
 
  return (
    <div className="mb-[16px] border-b border-gray-200">
      <div className="flex h-7 items-start gap-4 font-medium text-[14px]">
        {arrayNavigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === "."}
            className={({ isActive }) =>
              `relative h-7 text-[13px] ${
                isActive
                  ? "font-medium text-blue-600"
                  : "text-gray-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {`${item.label}  `}
  

                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-blue-600" />
                )}
              </>
            )}
            
          </NavLink>
        ))}
      </div>
    </div>
  );
};
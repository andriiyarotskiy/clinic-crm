
import { NavLink } from "react-router-dom";

 type Navigation={
    label: string;
   path: string;
   showCount?: boolean;
   count?: number;
}
type Props = {
  arrayNavigation: Navigation[];
  
 
  }

export const SmallNavbar: React.FC<Props> = ({ arrayNavigation }) => {
  
  
 
  return (
    <div className="mb-[24px] border-b border-gray-200">
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
    {`${item.label} `}

    {item.showCount && item.count !== undefined && (
      <span
        className={`ml-1 px-[4px] rounded-[8px] ${
          isActive
            ? "text-blue-600 bg-[#DBEAFE]"
            : "text-gray-400 bg-[#DBEAFE]"
        }`}
      >
        {item.count}
      </span>
    )}

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
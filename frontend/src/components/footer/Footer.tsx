import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { logoutThunk } from "@/features/auth/logOutThunk";
import { CiLogout } from "react-icons/ci";
import { errorToast, successToast } from "../pushAppMessage/PushApp";
import { useState } from "react";
import { ConfirmModal } from "../confirmModal/ConfirmModal";
import { footerNavigation } from "@/shared/config/footerNavigation";
import { NavLink } from "react-router-dom";
export const Footer: React.FC = () => {
  const [modal, setOpenModal] = useState(false);

  const dispatch = useAppDispatch();
  const {loading} = useAppSelector(state=>state.auth)
   const isActiveVisit = useAppSelector(
      (state) => state.visit.isActiveVisit
    );
  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap() 
      successToast("Logout successfuly")
    }
    catch (e) {
      errorToast(`${e}`)
      
    }

    
  }
  
    const handleNavigation = (
      event: React.MouseEvent<HTMLAnchorElement>
    ) => {
      if (isActiveVisit) {
        event.preventDefault();
      }
    };
  return (<>
    <ConfirmModal
      isOpen={modal} 
      title={"DO YOU WANT TO LEAVE?"}
      description="the session will be completed!"
    loading={loading}
    onConfirm={ handleLogout}
      onCancel={() => setOpenModal(false)} />
  <div className="pt-[8px] mx-[16px] border-t border-[#E5E7EB] ">
    <div className=" h-[40px]  pb-16px  ">
      <nav className="flex flex-col ">
        <ul>
          {footerNavigation.map((nav) => (
            <li
              key={nav.title}
              className="flex justify-right w-full h-[40px] mb-[8px]"
            >
              <NavLink
              className={({ isActive }) => `
  flex items-center h-full w-full rounded-[8px]
  pl-[12px] pr-[12px]
  ${
    isActiveVisit
      ? "cursor-not-allowed opacity-60"
      : "hover:bg-[#EFF6FF] hover:text-[#1E3A8A]"
  }
  ${
    isActive
      ? "text-[#1E3A8A] bg-[#DBEAFE]"
      : "text-[#1F2937]"
  }
`}
                to={nav.path}
                onClick={handleNavigation}
              >
                <span className="w-[20px] h-[20px] mr-[8px]">
                  {nav.icon}
                </span>

                <span className={`font-[Inter] font-medium text-[16px] ${nav.title==="Dashboard"?"rext-[#1F2937]":"text-[#374151]"}`}>
                  {nav.title}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      </div>
    <div className=" h-[40px] pb-16px   ">
      
      <button disabled={loading} onClick={()=>setOpenModal(true)}
        className=" w-full h-full 
    flex items-center  rounded-[8px]
     pl-[12px] pr-[12px] 
      hover:bg-[#C2410C]
       hover:text-[#FFFF]
   text-[#1F2937]">
        
    <>
      <CiLogout className="w-[20px] h-[20px] mr-[8px]" />
      <span>Log out</span>
    </>
  </button>
    </div></div>
  </>)
}
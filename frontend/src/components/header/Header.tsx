
import { Input } from "../input/Input";
import { CiBellOn } from "react-icons/ci";
import { UserInfo } from "./component/userInfo/UserInfo";
import { useAppSelector } from "@/app/store/hook";


export const Header: React.FC = () => {
 const user = useAppSelector(state => state.auth.user)
  console.log(user,'sdfsdf')
  return (
    <>
      <div className="w-full flex  justify-between  h-[76px] px-[24px] py-[16px] ">
        <Input
          name="search"
          type="search"
          placeholder="Search patients, doctors, appointments..."
          inputClassName=" h-[44px]"
          
         
        />
        <div className="flex justify-between items-center ml-[16px]">
          <button className="relative w-[44px] h-[44px] p-[9px]  border border-solid border-[#E5E7EB] rounded-[8px]">
            <CiBellOn className=" w-[24px] h-[24px] " />
            <div className="absolute w-[8px] h-[8px] right-[12px] top-[13px] rounded-[100%] bg-[#EF4444]"></div>
          </button>
<div className="h-full ml-[16px]  border-l border-[#E5E7EB]"></div>
          {user && <UserInfo user={user}/>}
        </div>
      </div>
    </>
  );
};

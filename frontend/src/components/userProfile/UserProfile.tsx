
import { capitalizeFirstLetter } from "@/shared/functions/capitalizwFirstLetter";
import type { Doctor } from "@/types/doctor";
import type { Patient } from "@/types/patient";
import { PiPhoneCallThin, PiEnvelopeSimpleLight } from "react-icons/pi";


type BaseProps = {
  avatar?: string;
  patients?: number | null;
};

type Props =
  | (BaseProps & {
      type: "doctor";
      selectedUser: Doctor;
    })
  | (BaseProps & {
      type: "patient";
      selectedUser: Patient;
    });

export const UserProfile: React.FC<Props> = ({ avatar,selectedUser, type }) => {
  const userYear = (date: string) => {
    return new Date().getFullYear() - new Date(date).getFullYear();
  };
 
  
    
  return (
    <>
      <div className="flex w-full mr-[16px] ">
        <img
          src={avatar}
          alt="User"
          className="mr-2 h-12 w-12 rounded-lg bg-amber-300 object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold">
              {selectedUser.firstName} {selectedUser.lastName}
            </h1>

            <span className="rounded-md bg-teal-100 px-[7px] py-[4px] text-[12px] font-medium text-teal-700">
              {type === "patient" ? "active" :capitalizeFirstLetter( selectedUser.employmentType)}
            </span>
          </div>

          <div className=" flex items-center justify-between text-[14px] text-gray-500">
            
            <div className="flex gap-[4px] font-medium text-[#4B5563]">
              <span>
                {type === "patient"
                  ? `ID: #${selectedUser.id}`
                  : `ID: #${selectedUser.doctorCode}`}
              </span>

              <span>
                {type === "patient"
                  ? `· ${userYear(selectedUser.dateOfBirth)} y.o.`
                  : `· ${selectedUser.yearsExperience} yrs exp.`}
              </span>
            </div>

            
         {  type ==='doctor' && <div className="flex gap-6 font-medium">
              <div className="flex items-center gap-2">
                <PiPhoneCallThin className="text-lg" />
                <span>{selectedUser.phoneNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <PiEnvelopeSimpleLight className="text-lg" />
                <span>{selectedUser.email}</span>
              </div>
            </div>}
          </div>
        </div>
      </div>

      {type === "doctor" && (
        <div className="w-[320px] pl-[16px] ml-auto border-l border-[#E5E7EB]">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-[#9CA3AF]">WORKLOAD</span>
            
          </div>
    <div className="flex items-center gap-3">
  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
    <div
      className={`h-full rounded-full ${
        selectedUser.workload < 65
          ? "bg-[#FB923C]"
          : selectedUser.workload < 85
            ? "bg-[#22C55E]"
            : "bg-[#EF4444]"
      }`}
      style={{ width: `${selectedUser.workload}%` }}
    />
  </div>

  <div className="w-10 text-[#9CA3AF] text-right">
    {selectedUser.workload}%
  </div>
</div>
       
        </div>
      )}
    </>
  );
};
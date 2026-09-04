import { useAppDispatch } from "@/app/store/hook"
import { ButtonPage } from "@/components/button/ButtonsPage"
import { Loader } from "@/components/loader/Loader"
import { BaseSelect } from "@/components/select/BaseSelect"
import { setDoctor, setSpecialization, setTime } from "@/features/appointments/appointmentsSlice"
import { specializations } from "@/features/doctors/model/specialties"
import { getAllDoctorsThunk } from "@/features/doctors/thunk/getAllDoctorsThunk"
import type { Doctor } from "@/types/doctor"
import { useEffect } from "react"
import { placeholderTimes } from "./playsholderTime"
import type { AvailableTimeSlot } from "@/features/appointments/model/avalibleTimeSlots"
import dayjs from "dayjs"



type Props = {
  selectedDate: string | null;
  loading: boolean;
  handleAside: () => void;
  availableTime: AvailableTimeSlot[];
  selectedSpecialization: string | null;
  selectedDoctorId: Doctor | null;
  doctors: Doctor[];
  bookedCount: number;
  availableCount: number;
};
export const AvalibleTime:React.FC<Props> = ({
  selectedDate,
  loading,
  handleAside,
  availableTime,
  selectedSpecialization,
  selectedDoctorId,
  doctors,bookedCount,availableCount }) => {
  const dispatch = useAppDispatch()
 
useEffect(() => {
  if (!selectedSpecialization) return;
  dispatch(
    getAllDoctorsThunk({
      specialization: selectedSpecialization,
    })
  );
}, [selectedSpecialization, dispatch]);
  
  return (<>
    
    <div className=" flex flex-col bg-[#FFFFFF] w-full h-[389px] rounded-[8px] px-[24px] py-[16px]">
     
      <div className="mb-[24px]">
        <h1 className="text-[14px] text-[#6B7280] font-semibold">AVALIBLE TIME SLOTS</h1>
      {selectedDate ? (
  <span className="text-[12px]">
    <span className="text-[#6B7280]">
      {dayjs(selectedDate).format("D MMMM YYYY")} {" "}
    </span>

           
    {selectedDoctorId && (
      <>
        <span className="text-[#15803D]">
          - {availableCount} available{" "}
        </span>

        <span className="text-[#B91C1C]">
          · {bookedCount} booked
        </span>
      </>
    )}
  </span>
) : (
  <span className="text-[14px] text-[#B91C1C]">
    Select a date for the appointment.
  </span>
)}
      </div>
      
      
      <div className=" flex justify-between mb-[32px]">
        <div className="flex h-[36px]">
        <BaseSelect
          name={"specializationSelect"}
            classNames={`mr-[8px] h-[36px] w-[218px] `}
             error={!selectedSpecialization && !!selectedDate}
        placeholder={"Select a speciality"}
        value={selectedSpecialization ?? ""}
        options={specializations}
        onChange={(value) => {
          dispatch(setSpecialization(value))
          setDoctor(null)
           
        }} />
      
          <BaseSelect
            error={!!selectedSpecialization && !!selectedDate && !selectedDoctorId}
            disabled={!selectedSpecialization}
            classNames="h-[36px] w-[218px]"
          name={'doctorSelect'}
        placeholder={"Select a doctor"}
  value={selectedDoctorId?.id ?? ""}
  options={doctors.map((doctor:Doctor) => ({
    value: String(doctor.id),
    label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
  }))}
   onChange={(value) => {
    if (!value) {
      dispatch(setDoctor(null));
      return;
    }

    const doctor = doctors.find(
      (d) => String(d.id) === value
    );

    if (!doctor) return;

    dispatch(setDoctor(doctor));
  }}
  
          />
        </div>
      <div className="flex items-center gap-6 font-medium">
  <div className="flex items-center gap-2">
    <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
    <span className="text-[14px] text-[#6B7280]">Free</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
    <span className="text-[14px] text-[#6B7280]">Booked</span>
  </div>
</div>
      </div>
     
      
      {loading ? <Loader /> : (<div className="grid grid-cols-7 gap-2 mb-[85px]">
       {availableTime?.length > 0 ? (
  availableTime.map((slot) => (
    <ButtonPage
      disabled={
        !selectedDate ||
        slot.status === "booked" ||
        slot.status === "expired"
      }
      key={slot.time}
      className="h-[36px] text-[#2563EB]"
      onClick={() => {
        handleAside();
        dispatch(setTime(slot.time));
      }}
    >
      {slot.time.slice(0, -3)}
    </ButtonPage>
  ))
) : (
  placeholderTimes.map((time) => (
    <ButtonPage
      key={time}
      disabled
      className="h-[36px] text-[#9CA3AF]"
    >
      {time}
    </ButtonPage>
  ))
)}
      </div>)}
     <div className="flex items-center  gap-2">
  <div className="w-4 h-px bg-[#D1D5DB]" />

  <span className="text-[12px] text-[#6B7280] whitespace-nowrap">
    Click a free slot to schedule a new appointment
  </span>

  <div className="w-full h-px bg-[#D1D5DB]" />
</div>
    </div>

  </>)
}
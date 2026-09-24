import { ButtonPage } from "@/components/button/ButtonsPage";
import { useEffect, useRef } from "react";
import { HiOutlinePencil } from "react-icons/hi2";
import { TbRefresh } from "react-icons/tb";
import { GiMedicines } from "react-icons/gi";
type Props = {
  onEditStatus: () => void;
  onReschedule: () => void;
  onClose: () => void;
   detailsAppointment: () => void;
};

export const ActionModal: React.FC<Props> = ({
  onClose,
  onEditStatus,
  onReschedule,
  detailsAppointment,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  return (
    <div  ref={modalRef} className="absolute right-full top-0 mr-2 z-50 w-[150px] h-[74px] rounded-lg border border-gray-200 bg-white shadow-lg">
      
      

      <ButtonPage
        onClick={onEditStatus}
        className="flex w-full h-[25px] items-center border-0 gap-3 px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
      >
        <HiOutlinePencil className="text-lg" />
        Edit status
      </ButtonPage>

      <ButtonPage
        onClick={onReschedule}
        className="flex w-full h-[25px] items-center border-0 gap-3 px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
      >
        <TbRefresh className="text-lg" />
        Reschedule
      </ButtonPage>
      <ButtonPage
        onClick={detailsAppointment}
        className="flex w-full h-[25px] items-center border-0 gap-3 px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
      >
        <GiMedicines className="text-lg" />
        Create Visits
      </ButtonPage>
    </div>
  );
};
import { FiSearch } from "react-icons/fi";
type Props = {
  description:string
}
export const EmptyState:React.FC<Props> = ({description}) => {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center">
      {/* Icon */}
      <div className="mb-[20px] flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E5E7EB]">
        <FiSearch
          size={24}
          strokeWidth={1.5}
          className="text-[#6B7280]"
        />
      </div>

      {/* Title */}
      <h3 className="mb-[6px] text-[16px] font-semibold leading-[24px] text-[#111827]">
        No results found
      </h3>

      {/* Description */}
      <p className="text-[14px] font-normal leading-[20px] text-[#6B7280]">
        {description}
       
      </p>
    </div>
  )
}
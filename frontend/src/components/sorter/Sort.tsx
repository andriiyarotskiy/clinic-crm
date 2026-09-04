import type { SortProps } from "@/features/doctors/model/sortDoctorTypes";
import { IoClose, IoSwapVertical } from "react-icons/io5";



export const Sort = <T extends string>({
  userCount,
  className,
  sortBy,
  sortOrder,
  buttons,
  onChange,
}: SortProps<T>) => {
  const handleClick = (value: T) => {
   
    if (value === sortBy) {
      onChange(
        value,
        sortOrder === "asc" ? "desc" : "asc",
      );

      return;
    }

   
    onChange(value, "asc");
  };

  const handleClear = (event: React.MouseEvent, value: T) => {
   
    event.stopPropagation();

    if (value === sortBy) {
      onChange(null, null);
    }
  };

  return (
    <div
      className={`
        flex
        h-[32px]
        items-center
        gap-2
        ${className ?? ""}
      `}
    >
      <div className="flex items-center gap-1 text-sm text-[#6B7280]">
        <IoSwapVertical size={16} />

        <span className="text-[12px]">Sort:</span>
      </div>

      {buttons.map((button) => {
        const isActive = sortBy === button.value;

        const label =
          isActive && sortOrder === "desc"
            ? button.descLabel
            : button.ascLabel;

        return (
          <button
            key={button.value}
            type="button"
            disabled={userCount < 2}
            onClick={() => handleClick(button.value)}
            className={`
              flex
              h-[32px]
              items-center
              gap-1.5
              rounded-full
              border
              px-3
              text-[12px]
              transition

              disabled:cursor-not-allowed
              disabled:opacity-50

              ${
                isActive
                  ? "border-[#BFDBFE] bg-[#DBEAFE] text-[#2563EB]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
              }
            `}
          >
            <span>{label}</span>

            {isActive && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleClear(event, button.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    onChange(null, null);
                  }
                }}
                className="flex shrink-0 cursor-pointer items-center"
              >
                <IoClose size={15} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
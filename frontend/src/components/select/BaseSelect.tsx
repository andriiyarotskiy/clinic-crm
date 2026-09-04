import { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
type Option = {
  label: string;
  value: string;
};

type Props = {
  name: string;
  classNames?: string;
  label?: string;
  options: Option[];
  value?: string | number | null;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
};

export const BaseSelect = ({
  error,
  disabled,
  name,
  classNames,
  label,
  options,
  value,
  placeholder = "Select...",
  onChange,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === String(value ?? "")
  );

  const hasValue = Boolean(selectedOption);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();

    onChange("");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-[#1F2937]"
        >
          {label}
        </label>
      )}

      <div
        ref={selectRef}
        className={`relative ${classNames ?? ""}`}
      >
        <button
          id={name}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setIsOpen((prev) => !prev)
          }}
          className={`
            flex
            w-full
            h-[36px]
            items-center
            justify-between
            rounded-[8px]
            border
            bg-white
           
            px-[12px]
            py-[8px]
            text-left
            outline-none
            transition-all
            duration-150
            

            ${
      disabled
        ? "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF]"
        : isOpen
          ? "cursor-pointer border-[#2563EB] ring-2 ring-[#2563EB]"
          : "cursor-pointer border-[#E5E7EB] bg-white"
    }
     ${
    error
      ? "border-red-500"
      : isOpen
        ? "border-[#2563EB] ring-2 ring-[#2563EB]"
        : "border-[#E5E7EB]"
  }
  `}
        >
          <span
            className={
              hasValue
                ? "text-[#1F2937] font-medium"
                : "text-[#6B7280] "
            }
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <div className="ml-2  flex items-center gap-2">
            {hasValue && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    handleClear(
                      event as unknown as React.MouseEvent
                    );
                  }
                }}
                className="
                  flex
                  h-[14px]
                  w-[14px]
                  items-center
                  justify-center
                  rounded-full
                  text-[16px]
                  leading-none
                  text-[#1F2937]
                  transition-colors
                  hover:bg-[#F3F4F6]
                  hover:text-[#1F2937]
                "
              >
                ×
              </span>
            )}

         { !hasValue &&  <span
              className={`
                text-[12px]
                text-[#9CA3AF]
                transition-transform
                duration-150
                ${isOpen ? "rotate-180" : ""}
              `}
            >
              {<MdKeyboardArrowDown/>}
            </span>}
          </div>
        </button>

        {isOpen && (
          <div
            className="
              absolute
              left-0
              top-[calc(100%+4px)]
              z-10
              w-full
              overflow-hidden
              rounded-[8px]
              font-medium
              border
              border-[#E5E7EB]
              bg-white
              mt-[8px]
              p-[4px]
              shadow-[0_4px_12px_rgba(0,0,0,0.08)]
            "
          >
            <div className="max-h-[220px] overflow-y-auto">
              {options.map((option) => {
                const isSelected =
                  option.value === String(value ?? "");

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      flex
                      w-full
                      h-[36px]
                      items-center
                      rounded-[6px]
                      px-[10px]
                      py-[8px]
                      text-left
                      text-sm
                      text-[#1F2937]
                      transition-colors
                      cursor-pointer

                      ${
                        isSelected
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "text-[#1F2937] hover:bg-[#F3F4F6]"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
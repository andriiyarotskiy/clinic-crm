import { useEffect, useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { LuCheck, LuChevronDown } from "react-icons/lu";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type Props<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  options: SelectOption[];
  placeholder: string;
  className?: string;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  error?: string;
  onChange?: (value: string) => void;
};

export const Select = <T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  className,
  control,
  rules,
  error,
  onChange,
}: Props<T>) => {
  const [open, setOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
         const selectedOption =
          options.find((option) => option.value === field.value) ??
          (field.value
            ? { label: field.value, value: field.value }
            : undefined);

        return (
          <div
            ref={selectRef}
            className={`relative flex flex-col ${className ?? ""}`}
          >
            {label && (
              <label
                htmlFor={name}
                className="mb-[10px] block font-[Inter] font-medium text-[14px]"
              >
                {label}
              </label>
            )}

           
            <button
              id={name}
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`
                flex
                h-[44px]
                w-full
                items-center
                justify-between
                rounded-[8px]
                border
                bg-white
                px-[8px]
                text-sm
                outline-none
                transition
                ${
                  open
                    ? "border-[2px] border-[#2563EB]"
                    : "border-[#E5E7EB]"
                }
              `}
            >
              <span
                className={
                  selectedOption
                    ? "text-[#1F2937]"
                    : "text-[#9CA3AF]"
                }
              >
                {selectedOption?.label ?? placeholder}
              </span>

              <LuChevronDown
                size={18}
                className={`
                  text-[#6B7280]
                  transition-transform
                  ${open ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* Dropdown */}
            {open && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-[calc(100%+2px)]
                  z-50
                  max-h-[220px]
                  overflow-y-auto
                  rounded-[8px]
                  border
                  border-[#E5E7EB]
                  bg-white
                  p-[4px]
                  shadow-lg
                "
              >
                {options.map((option) => {
                  const selected =
                    option.value === field.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => {
                        if (option.disabled) return;

                        field.onChange(option.value);
                        onChange?.(option.value);

                        setOpen(false);
                      }}
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-[6px]
                        px-[10px]
                        py-[8px]
                        text-left
                        text-sm
                        transition
                        ${
                          option.disabled
                            ? "cursor-not-allowed text-[#9CA3AF]"
                            : "cursor-pointer text-[#1F2937] hover:bg-[#EFF6FF]"
                        }
                        ${
                          selected
                            ? "bg-[#EFF6FF] text-[#2563EB]"
                            : ""
                        }
                      `}
                    >
                      <span>{option.label}</span>

                      {selected && (
                        <LuCheck
                          size={16}
                          className="text-[#2563EB]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <span className="mt-1 text-sm text-red-500">
                {error}
              </span>
            )}
          </div>
        );
      }}
    />
  );
};
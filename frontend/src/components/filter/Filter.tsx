import { useEffect, useState } from "react";
import { Input } from "../input/Input";
import { useDebounce } from "@/hooks/useDebounce"
import { BaseSelect } from "../select/BaseSelect";

export type FilterOption = {
  label: string;
  value: string;
};

type Props = {
  className?: string;

  search?: string;

  firstSelect?: string;
  secondSelect?: string;

  firstPlaceholder?: string;
  secondPlaceholder?: string;

  firstSelectOptions?: FilterOption[];
  secondSelectOptions?: FilterOption[];

  onSearchChange?: (value: string) => void;
  onFirstSelectChange?: (value: string) => void;
  onSecondSelectChange?: (value: string) => void;
};

export const Filter: React.FC<Props> = ({
  firstPlaceholder,
  secondPlaceholder,
  search,
  className,
  firstSelect,
  secondSelect,
  firstSelectOptions,
  secondSelectOptions,
  onSearchChange,
  onFirstSelectChange,
  onSecondSelectChange,
 
}) => {
  const [value, setValue] = useState(search);

  const debouncedSearch = useDebounce(value, 500);

  useEffect(() => {
    if(!onSearchChange){return}
    onSearchChange(debouncedSearch?? "");
  }, [debouncedSearch]);

  return (
    <div className ={`flex items-center gap-2  ${className ?? ""}`} >
      {onSearchChange && <Input 
         inputClassName="h-[36px]"
        name="124"
        type="search"
        value={value}
        placeholder="Search ..."
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-[36px] rounded-[8px]  bg-white color-[#6B7280] "
      />}
      {firstSelectOptions && (
        <BaseSelect
          name="firstSelect"
          classNames="h-[36px] w-[190px]"
          placeholder={firstPlaceholder ?? "Select"}
          value={firstSelect ?? ""}
          options={firstSelectOptions}
          onChange={(value) => {
            onFirstSelectChange?.(value);
          }}
        />
      )}

    {secondSelectOptions && (
        <BaseSelect
          name="secondSelect"
          classNames="h-[36px] w-[190px]"
          placeholder={secondPlaceholder ?? "Select"}
          value={secondSelect ?? ""}
          options={secondSelectOptions}
          onChange={(value) => {
            onSecondSelectChange?.(value);
          }}
        />
      )} 

    </div>
  );
};
      
  
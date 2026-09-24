import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

type Props<
  T extends FieldValues,
  TName extends Path<T>
> = {
  name: TName;
  label: string;
  options: string[];
  disabledOptions?: string[];
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T, TName>;
  error?: string;
};

export function CheckboxGroup<
  T extends FieldValues,
  TName extends Path<T>
>({
  name,
  label,
  options,
  disabledOptions = [],
  register,
  rules,
  error,
}: Props<T, TName>) {
  return (
    <div className="flex flex-col">
      <label className="mb-[10px] font-[Inter] font-medium text-[14px]">
        {label}
      </label>

      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const disabled = disabledOptions.includes(option);

          return (
            <label
              key={option}
              className={`min-w-[55px] ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                value={option}
                disabled={disabled}
                className="peer hidden"
                {...(register ? register(name, rules) : {})}
              />

              <div
                className={`
                  flex
                  text-[15px] font-medium 
                  h-[44px]
                  w-[55px]
                  items-center
                  justify-center
                  rounded-[8px]
                  border
                  border-gray-300
                  transition-all
                  peer-checked:border-blue-600
                  peer-checked:bg-blue-50
                  peer-checked:text-blue-600
                  ${
                    disabled
                      ? "bg-gray-100 text-gray-400"
                      : "hover:border-blue-400"
                  }
                `}
              >
                {option}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-[13px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
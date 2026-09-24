
import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  rows?: number;

  register: UseFormRegister<T>;
  rules?: RegisterOptions<T>;
  error?: string;

  containerClassName?: string;

  
  labelClassName?: string;

  
  textareaClassName?: string;

  readOnly?: boolean;
};

export const TextArea = <T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 5,
  register,
  rules,
  error,
readOnly = false,
  containerClassName = "",
  labelClassName = "",
  textareaClassName = "",
}: Props<T>) => {
  return (
    <div className={`flex flex-col ${containerClassName}`}>
      <label
        htmlFor={name}
        className={`mb-[10px] text-[14px] font-medium ${labelClassName}`}
      >
        {label}
      </label>

      <textarea
        readOnly={readOnly}
  id={name}
  rows={rows}
  placeholder={placeholder}
  {...register(name, rules)}
  className={`
    w-full
    resize-none
    rounded-[5px]
    border
    border-gray-300
    px-3
    py-2
    outline-none
    transition-colors
    focus:border-blue-500

    ${error ? "border-red-500" : ""}
    ${textareaClassName}
  `}
/>

      {error && (
        <span className="mt-1 text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};


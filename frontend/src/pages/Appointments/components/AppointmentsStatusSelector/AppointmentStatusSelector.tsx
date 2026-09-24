import type { StatusOptions } from "@/features/appointments/model/statusAppointments";


type Props = {
  options: StatusOptions[];
  value: string| null;
  onChange: (value: string) => void;
};

export const AppointmentStatusSelector: React.FC<Props> = ({
  options,
  value,
  onChange,
}) => {
  console.log(options)
  return (
    <div className=" mb-[16px] rounded-lg border border-gray-200 overflow-hidden">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          className={`
            w-full
            h-[66px]
            flex
            items-center
            justify-between
            px-4
            py-4
            text-left
            border-b
            border-gray-200
            transition

            ${
              option.disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-50"
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className={`
                mt-1
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                border-2
                ${
                  value === option.value
                    ? "border-blue-600"
                    : "border-gray-300"
                }
              `}
            >
              {value === option.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {option.label}
                </span>

                <span
                  className={`h-2.5 w-2.5 rounded-full   ${option.dotColor}`}
                />
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {option.description}
              </p>
            </div>
          </div>

          {option.icon && (
            <div className="text-red-500 text-lg">
              {option.icon}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
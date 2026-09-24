import { BaseSelect } from "@/components/select/BaseSelect";
import dayjs from "dayjs";

type DateFilterProps = {
  value?: string;
  onChange: (
    value: string,
    dateFrom: string | null,
    dateTo: string | null,
  ) => void;
};

const dateOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
];

export const DateFilter = ({
  onChange,
  value,
}: DateFilterProps) => {
  const handleChange = (value: string) => {
    const today = dayjs();

    switch (value) {
      case "today": {
        const date = today.format("YYYY-MM-DD");

        onChange(value, date, date);
        break;
      }

      case "yesterday": {
        const date = today
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        onChange(value, date, date);
        break;
      }

      case "last7days": {
        const dateFrom = today
          .subtract(6, "day")
          .format("YYYY-MM-DD");

        const dateTo = today.format("YYYY-MM-DD");

        onChange(value, dateFrom, dateTo);
        break;
      }

      case "last30days": {
        const dateFrom = today
          .subtract(29, "day")
          .format("YYYY-MM-DD");

        const dateTo = today.format("YYYY-MM-DD");

        onChange(value, dateFrom, dateTo);
        break;
      }

      case "thisMonth": {
        const dateFrom = today
          .startOf("month")
          .format("YYYY-MM-DD");

        const dateTo = today
          .endOf("month")
          .format("YYYY-MM-DD");

        onChange(value, dateFrom, dateTo);
        break;
      }
    }
  };

  return (
    <BaseSelect
      name="dateFilter"
      classNames="h-[36px] w-[190px]"
      placeholder="Date range"
      value={value}
      options={dateOptions}
      onChange={handleChange}
    />
  );
};
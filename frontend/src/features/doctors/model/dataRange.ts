import dayjs from "dayjs";

const today = dayjs();

export const dateOptions = [
  {
    label: "Today",
    value: `${today.format("YYYY-MM-DD")}_${today.format("YYYY-MM-DD")}`,
  },
  {
    label: "Yesterday",
    value: `${today.subtract(1, "day").format("YYYY-MM-DD")}_${today.subtract(1, "day").format("YYYY-MM-DD")}`,
  },
  {
    label: "Tomorrow",
    value: `${today.add(1, "day").format("YYYY-MM-DD")}_${today.add(1, "day").format("YYYY-MM-DD")}`,
  },
  {
    label: "Last 7 days",
    value: `${today.subtract(6, "day").format("YYYY-MM-DD")}_${today.format("YYYY-MM-DD")}`,
  },
  {
    label: "Next week",
    value: `${today.add(1, "week").startOf("week").format("YYYY-MM-DD")}_${today.add(1, "week").endOf("week").format("YYYY-MM-DD")}`,
  },
  {
    label: "Last 30 days",
    value: `${today.subtract(29, "day").format("YYYY-MM-DD")}_${today.format("YYYY-MM-DD")}`,
  },
];
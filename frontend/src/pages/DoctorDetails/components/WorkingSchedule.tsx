export const WorkingSchedule = () => {
  const schedule = [
    {
      day: "Monday",
      time: "08:00 — 18:00",
    },
    {
      day: "Tuesday",
      time: "08:00 — 18:00",
    },
    {
      day: "Wednesday",
      time: "08:00 — 18:00",
    },
    {
      day: "Thursday",
      time: "08:00 — 18:00",
    },
    {
      day: "Friday",
      time: "08:00 — 18:00",
    },
    {
      day: "Saturday",
      time: "10:00 — 14:00",
      disabled: true,
    },
  ];

  return (<>
  <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-gray-600">
              WORKING SCHEDULE
            </h2>

            <div>
              {schedule.map((item) => (
                <div
                  key={item.day}
                  className={`flex h-[44px] items-center justify-between border-b border-gray-200 text-[14px] ${
                    item.disabled
                      ? "text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  <span className=" text-[16px] font-medium text-[#000000]">{item.day}</span>

                  <span className="text-[16px] text-[#374151]">{item.time}</span>
                </div>
              ))}
            </div>
          </section></>)
}
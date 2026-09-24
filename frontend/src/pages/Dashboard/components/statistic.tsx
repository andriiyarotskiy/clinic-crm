
export const DashboardStats = () => {
  

  const revenue = [
    {
      day: "Mo",
      height: "h-[106px]",
    },
    {
      day: "Tu",
      height: "h-[121px]",
    },
    {
      day: "We",
      height: "h-[137px]",
    },
    {
      day: "Th",
      height: "h-[176px]",
      active: true,
    },
    {
      day: "Fr",
      height: "h-[121px]",
    },
    {
      day: "Sa",
      height: "h-[74px]",
    },
    {
      day: "Su",
      height: "h-[24px]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-2">
      <div className="mx-auto max-w-[1150px]">

        {/* ===================== STAT CARDS ===================== */}

      

        {/* ===================== CHARTS ===================== */}

        <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[0.8fr_1.25fr]">

          {/* ================= APPOINTMENTS OUTCOMES ================= */}

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-[13px] font-semibold text-gray-600">
              APPOINTMENTS OUTCOMES
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              June 2026
            </p>

            {/* Donut */}

            <div className="mt-7 flex justify-center">
              <div
                className="relative flex h-[155px] w-[155px] items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#8bb9f5 0deg 85deg, white 85deg 89deg, #2dd4bf 89deg 346deg, white 346deg 350deg, #8ee24d 350deg 370deg, white 370deg 374deg, #facc15 374deg 360deg)",
                }}
              >
                {/* Inner circle */}

                <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[25px] font-semibold leading-none text-gray-900">
                    114
                  </span>

                  <span className="mt-1 text-[11px] font-medium text-gray-500">
                    appointments
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}

            <div className="mt-7 space-y-3">
              {/* New */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-300" />

                  <span className="text-[12px] text-gray-600">
                    New
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-[75px] rounded-full bg-gray-200">
                    <div className="h-full w-[24%] rounded-full bg-blue-300" />
                  </div>

                  <span className="w-5 text-right text-[12px] font-semibold text-gray-700">
                    27
                  </span>
                </div>
              </div>

              {/* Repeated */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-[12px] text-gray-600">
                    Repeated
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-[75px] rounded-full bg-gray-200">
                    <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-green-400 to-cyan-400" />
                  </div>

                  <span className="w-5 text-right text-[12px] font-semibold text-gray-700">
                    82
                  </span>
                </div>
              </div>

              {/* Missed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />

                  <span className="text-[12px] text-gray-600">
                    Missed Appointments
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-[75px] rounded-full bg-gray-200">
                    <div className="h-full w-[8%] rounded-full bg-yellow-400" />
                  </div>

                  <span className="w-5 text-right text-[12px] font-semibold text-gray-700">
                    5
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= WEEKLY REVENUE ================= */}

          <section className="rounded-lg border border-gray-200 bg-white p-5">

            {/* Header */}

            <h2 className="text-[13px] font-semibold text-gray-500">
              WEEKLY REVENUE
            </h2>

            <div className="mt-2 flex items-center gap-4">
              <span className="text-[24px] font-semibold leading-none text-gray-900">
                ₴ 76 728
              </span>

              <span className="text-[11px] font-medium text-red-500">
                ↓ +8% vs last week
              </span>
            </div>

            {/* Chart */}

            <div className="relative mt-6 h-[225px]">

              {/* Y axis */}

              <div className="absolute left-0 top-0 flex h-[180px] flex-col justify-between text-[10px] text-gray-500">
                <span>₴95k</span>
                <span>₴56k</span>
                <span>₴32k</span>
                <span>₴16k</span>
                <span>₴0</span>
              </div>

              {/* Chart */}

              <div className="absolute left-[40px] right-0 top-0 h-[180px]">

                {/* Grid */}

                <div className="absolute left-0 right-0 top-0 border-t border-gray-200" />

                <div className="absolute left-0 right-0 top-[48px] border-t border-gray-200" />

                <div className="absolute left-0 right-0 top-[96px] border-t border-gray-200" />

                <div className="absolute left-0 right-0 top-[144px] border-t border-gray-200" />

                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200" />

                {/* Bars */}

                <div className="absolute inset-0 flex items-end justify-around px-5">

                  {revenue.map((item) => (
                    <div
                      key={item.day}
                      className="relative flex h-full w-8 items-end justify-center"
                    >
                      {/* Peak day */}

                      {item.active && (
                        <div className="absolute bottom-[170px] left-1/2 -translate-x-1/2">
                          <div className="relative whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-medium text-white">
                            ↑ Peak da

                            <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-blue-600" />
                          </div>
                        </div>
                      )}

                      {/* Bar */}

                      <div
                        className={`w-[22px] rounded-t-md ${
                          item.active
                            ? "bg-sky-500"
                            : "bg-sky-200"
                        } ${item.height}`}
                      />

                      {/* Day */}

                      <span className="absolute -bottom-8 text-[12px] text-gray-500">
                        {item.day}
                      </span>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
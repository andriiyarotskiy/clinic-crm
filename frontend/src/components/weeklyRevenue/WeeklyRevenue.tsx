import type { WeeklyRevenueDay } from "@/features/statistics/statisticsSlice";
import type React from "react";
import { useState } from "react";
type HoveredBar = {
  day: string;
  type: "actual" | "expected";
  clasName?:'border-[#1D4ED8]'
};

type Props = {
  currentDay:string,
  total: number,
  change: number | null,
  data:WeeklyRevenueDay[]
};

export const WeeklyRevenue: React.FC<Props> = ({ currentDay, total, change, data }) => {
  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null);

  const maxValue = Math.max(
  ...data.map((item) => Math.max(item.expected, item.actual))
);

const maxYAxis = Math.ceil(maxValue / 1000) * 1000;

const yAxis = Array.from(
  { length: 5 },
  (_, index) => ((maxYAxis) / 4) * index
).reverse();

  return (
    <>
      <section className="h-[352px] rounded-lg border border-gray-200 bg-white py-[16px] px-[24px]">
        {/* Header */}

        <h2 className="text-[13px] font-semibold text-gray-500">
          WEEKLY REVENUE
        </h2>

        <div className="mt-2 flex items-center gap-4">
          <span className="text-[24px] font-semibold leading-none text-gray-900">
            ₴ {total}
          </span>

          {  change !== 0 && change !== null ? (<p className={`mt-3 text-[11px] font-medium ${change<0? "text-red-600":"text-green-700"}`}>
        {change > 0 ? '↗ +' : '↓'}
       { `${change}% vs last week`}
      </p>):(<p className={`mt-3 text-[11px] font-medium ${"text-green-700"}`}>
        
       { ``}
      </p>)}
        </div>

        {/* Chart */}

        <div className="relative mt-[40px] h-[236px]">
          {/* Y axis */}

          <div className="absolute left-0 top-0 flex h-[208px] flex-col justify-between text-[12px] text-gray-500">
      {yAxis.map((item,index) => (
  <span key={`${item}-${index}`}>
    ₴{item >= 1000 ?  `${Math.round(item / 1000)}K` : item}
  </span>
))}
           
          </div>

          {/* Chart */}

          <div className="absolute left-[40px]  right-0 top-0 h-[208px]">
            {/* Grid */}

            <div className="absolute left-0 right-0 top-[8px] border-t border-gray-200" />

            <div className="absolute left-0 right-0 top-[56px] border-t border-gray-200" />

            <div className="absolute left-0 right-0 top-[104px] border-t border-gray-200" />

            <div className="absolute left-0 right-0 top-[150px] border-t border-gray-200" />

            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200" />

           {/* Bars */}

          <div className="absolute inset-0 flex items-end justify-around px-5">
            {data.map((item) => (
              <div
                key={item.day}
                className="relative flex h-full w-[44px] items-end justify-center"
              >
                {/* Peak day */}

                {item.isPeakDay && item.expected < item.actual && (
                  <div
                    className=" absolute  left-5.5 -translate-x-1/2 z-20 " 
                    style={{
                      bottom: `${(item.actual / maxValue) * 101}%`,
                    }}
                  >
                    <div className="  relative w-[80px] h-[32px] p-[8px] whitespace-nowrap rounded-lg bg-blue-600  text-[12px] font-medium text-white">
                      ↑ Peak day

                      <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-blue-600" />
                    </div>
                  </div>
                )}

                {/* EXPECTED BAR */}

                {item.expected > 0 && <div
                  className="relative w-[22px]  rounded-t-md  hover:border-[2px] border-amber-400  "
                  style={{
                    height: `${(item.expected / maxValue) * 98}%`,
                  }}
                  onMouseEnter={() =>
                    setHoveredBar({
                      day: item.day,
                      type: "expected",
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="h-full w-full rounded-t-md bg-amber-200" />

                  {/* Expected tooltip */}

                  {hoveredBar?.day === item.day &&
                    hoveredBar.type === "expected" && (
                      <div className="absolute bottom-[calc(100%-10px)] left-[14px] z-50">
                        <div className="relative w-[207px] h-[64px] rounded-[8px] border border-amber-400 bg-white px-[14px] p-[8px] shadow-sm">
                          <div className="flex items-center gap-[6px] text-[12px] font-medium text-blue-500">
                            <span className="text-[16px] leading-none">
                              +
                            </span>

                            <span>Expected of  this day</span>
                          </div>

                          <div className="mt-[4px] text-[14px] font-semibold text-gray-900">
                            ₴ {item.expected.toLocaleString("uk-UA")}
                          </div>

         

         
                        </div>
                      </div>
                    )}
                </div>}

                {/* ACTUAL BAR */}

                <div
                  className={`relative w-[22px] rounded-t-md hover:border-[2px] border-[#1D4ED8] ${
                    item.day === currentDay
                      ? "bg-sky-500"
                      : "bg-sky-200"
                  }`}
                  style={{
                    height: `${(item.actual / maxValue) * 98}%`,
                  }}
                  onMouseEnter={() =>
                    setHoveredBar({
                      day: item.day,
                      type: "actual",
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Actual tooltip */}

                {hoveredBar?.day === item.day &&
    hoveredBar.type === "actual" && (
      <div className="absolute bottom-[calc(100%-10px)] left-[14px] z-50">
        <div className="relative w-[207px] h-[64px] rounded-[8px] border border-blue-500 bg-white px-[14px] p-[8px] shadow-sm">
          <div className="flex items-center gap-[6px] text-[12px] font-medium text-blue-500">
            <span className="text-[16px] leading-none">
              ↑
            </span>

           {item.isPeakDay?<span>Pick day this week</span>:( <span>Actual of this day</span>)}
          </div>

          <div className="mt-[4px] text-[14px] font-semibold text-gray-900">
            ₴ {item.actual.toLocaleString("uk-UA")}
          </div>

         

         
        </div>
      </div>
    )}
</div>
                  {/* Day */}

                <span className={`absolute -bottom-8 rounded-[8px] px-[6px] py-[3px] text-[12px] 
                    ${item.day === currentDay?' text-[#030712] bg-[#DCFCE7]': 'text-gray-500'}`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

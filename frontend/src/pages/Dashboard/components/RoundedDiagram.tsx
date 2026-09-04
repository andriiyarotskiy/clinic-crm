import type { AppointmentOutcomesData } from "@/features/statistics/statisticsSlice";

type Props = {
  info:AppointmentOutcomesData,
  currentMonth: string;
}
export const RoundedDiagram:React.FC<Props> = ({ info,  currentMonth }) => {

const total = info.total;

const completedPercent = total
  ? Math.trunc((info.completed / total) * 100)
  : 0;

const noShowPercent = total
  ? Math.trunc((info.noShow / total) * 100)
  : 0;

const cancelledPercent = total
  ? Math.trunc((info.cancelled / total) * 100)
  : 0;
  const gap = 4;

const completedStart = gap;
const completedEnd = completedPercent * 3.6;

const noShowStart = completedEnd + gap;
const noShowEnd = noShowStart + noShowPercent * 3.6;

const cancelledStart = noShowEnd + gap;
const cancelledEnd = cancelledStart + cancelledPercent * 3.6;

  return (<>  

          {/* ================= APPOINTMENTS OUTCOMES ================= */}

          <section className="h-[352px] py-[16px] px-[24px] rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-[13px] font-semibold text-gray-600">
              APPOINTMENTS OUTCOMES
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {currentMonth}
            </p>

            {/* Donut */}

            <div className="mt-7 flex justify-center">
              <div
                className="relative flex h-[156px] w-[156px] items-center justify-center rounded-full"
     style={{
  background: `conic-gradient(
    from 0deg,

    white 0deg ${completedStart}deg,

    #8ee24d ${completedStart}deg ,
    #22d3ee ${completedEnd}deg,

    white ${completedEnd}deg ${noShowStart}deg,

    #FDBA74 ${noShowStart}deg ${noShowEnd}deg,

    white ${noShowEnd}deg ${cancelledStart}deg,

    #FDE047 ${cancelledStart}deg ${cancelledEnd}deg,

    white ${cancelledEnd}deg 360deg
  )`,
}}
  
              >
                {/* Inner circle */}

                <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[25px] font-semibold leading-none text-gray-900">
                    {info.total}
                  </span>

                  <span className="mt-1 text-[11px] font-medium text-gray-500">
                    appointments
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}

      

            <div className="mt-[16px] space-y-3">
              {/* New */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full  bg-gradient-to-r from-green-400 to-cyan-400" />

                  <span className="text-[12px] text-gray-600">
                  Completed
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-[75px] rounded-full bg-gray-200">
              <div className={`h-full  rounded-full  bg-gradient-to-r from-green-400 to-cyan-400`}
              style={{ width: `${completedPercent}%` }}/>
                  </div>

                  <span className="w-5 text-right text-[12px] font-semibold text-gray-700">
                    {info.completed}
                  </span>
                </div>
              </div>

              {/* Repeated */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FDBA74]" />

                  <span className="text-[12px] text-gray-600">
                   No-show
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-[75px] rounded-full bg-gray-200">
              <div className={`h-full  rounded-full bg-[#FDBA74]`}
               style={{ width: `${noShowPercent}%` }}/>
                  </div>

                  <span className="w-5 text-right text-[12px] font-semibold text-gray-700">
                  {info.noShow}
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
              <div className={`h-full  rounded-full bg-yellow-400`} 
               style={{ width: `${cancelledPercent}%` }}/>
                  </div>

                  <span className="w-5 text-right text-[12px] font-semibold text-gray-700">
                    {info.cancelled}
                  </span>
                </div>
              </div>
            </div>
    </section>
    
</>)
}
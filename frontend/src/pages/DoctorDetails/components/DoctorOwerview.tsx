import { CardStatistics } from "@/components/cardStatistics/CardStatistics";
import { detailsDoctorCardStatistics } from "@/features/statistics/model/detailsDoctorCardStatistics";
import { WorkingSchedule } from "./WorkingSchedule";
import { WeeklyRevenue } from "@/components/weeklyRevenue/WeeklyRevenue";
import { useAppSelector } from "@/app/store/hook";

export const DoctorOverview = () => {
  const cards = useAppSelector(
    (state) => state.statistic.statistics.doctorDetailsCard,
  );
  const revenue = useAppSelector(
    (state) => state.statistic.statistics.doctorWeeklyRevenue,
  );
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", {
    weekday: "short",
  });
  return (
    <>
      <div className=" grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4 mb-[8px]">
        {cards &&
          detailsDoctorCardStatistics.map((card) => (
            <CardStatistics
              key={card.key}
              title={card.title}
              icon={card.icon}
              iconClass={card.iconClass}
              value={cards[card.key].total}
              change={cards[card.key].change}
            />
          ))}
      </div>
      <div className=" h-[352px] mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[0.8fr_1.25fr]">
        <WorkingSchedule />
        {revenue && (
          <WeeklyRevenue
            currentDay={currentDay}
            total={revenue.total}
            change={revenue.change}
            data={revenue.data}
          />
        )}
      </div>
    </>
  );
};

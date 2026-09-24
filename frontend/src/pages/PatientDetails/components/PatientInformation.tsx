import { detailsPatientCardStatistics } from "@/features/statistics/model/detailsPatientCardStatistics";
import { CardStatistics } from "@/components/cardStatistics/CardStatistics";
import { useAppSelector } from "@/app/store/hook";
import dayjs from "dayjs";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-[15px] text-slate-800">{value}</p>
  </div>
);

export const PatientInformation = () => {
  
  const cards = useAppSelector(state => state.statistic.statistics.patientDetailsCard)
  const selectedPatient = useAppSelector(state=>state.patient.selectedPatient)
  return (<>
      {/* Medical alerts */}
      <section className="mb-[8px] rounded-lg border border-slate-200 bg-white px-5 py-4">
        <h2 className="text-[13px] font-semibold uppercase text-slate-500">
          Medical alerts & conditions
        </h2>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs text-red-700">
            Allergy: Penicillin
            <button type="button" className="ml-1 text-red-500">
              ×
            </button>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs text-red-700">
            Requires premedication
            <button type="button" className="ml-1 text-red-500">
              ×
            </button>
          </span>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Add allergy
          </button>
        </div>
    </section>
    <section>
        <div className=" grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4 mb-[8px]">
          {detailsPatientCardStatistics.map((card) => {
  const data =
    card.key === "balance"
      ? undefined
      : cards?.[card.key];

  return (
    <CardStatistics
      prefix={card.prefix} 
      key={card.key}
      title={card.title}
      icon={card.icon}
      iconClass={card.iconClass}
      value={data?.total ?? card.value}
      change={data?.change ?? card.change}
    />
  );
})}
          </div>
    </section>
    {/* Information */}
      <div className=" grid grid-cols-1 gap-2 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Personal info */}
        <section className=" rounded-lg border border-slate-200 bg-white px-5 py-4">
          <h2 className="mb-[24px] text-[13px] font-semibold uppercase text-slate-500">
            Personal info
          </h2>

         {selectedPatient && <div className=" grid grid-cols-2 gap-x-8 gap-y-7">
           
       <InfoItem label="Gender" value={selectedPatient?.gender} />
            <InfoItem label="Mobile number" value={selectedPatient?.phoneNumber} />

            <InfoItem label="City" value={selectedPatient?.address} />
            <InfoItem label="Address" value="St. Saint Street" />

            <InfoItem label="Birth date" value={dayjs(selectedPatient.dateOfBirth).format("D MMMM YYYY")} />
            <InfoItem label="Member status" value="Active" />
          </div>}
        </section>

        {/* Administrative info */}
        <section className="rounded-lg border border-slate-200 bg-white px-5 py-4">
          <h2 className="text-[13px] font-semibold uppercase text-slate-500">
            Administrative info
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-7">
            <InfoItem
              label="Patient Source"
              value="Recommendation M.Polischuk"
            />

            <InfoItem label="Preferred time" value="After 12 a.m." />

            <InfoItem
              label="Confirmation preference"
              value="Phone call"
            />

            <InfoItem label="Preferred language" value="English" />

            <InfoItem label="Reminder type" value="SMS" />

            <InfoItem label="Registration date" value="14.08.2022" />
          </div>
        </section>
      </div>
  </>)
}
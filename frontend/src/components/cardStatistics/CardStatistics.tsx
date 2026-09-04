type CardStatisticsProps = {
  value: number ;
  title: string;
  icon: React.ElementType;
  change: number | null;
  iconClass: string;
  prefix?: string;
};

export const CardStatistics: React.FC<CardStatisticsProps> = ({
  prefix,
  iconClass,
  value,
  title,
  icon: Icon,
  change,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-500">
            {title}
          </p>

          <p className="mt-3 text-[21px] font-semibold leading-none text-gray-900">
           {prefix} {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={16} strokeWidth={1} />
        </div>
      </div>

     {  change  ? (<p className={`mt-3 text-[11px] font-medium ${change<0? "text-red-600":"text-green-700"}`}>
        {change > 0 ? '↗ +' : '↓'}
       { `${change}% vs last week`}
      </p>):(<p className='mt-3 text-[11px] font-medium text-green-700'>
        
       { `on this week`}
      </p>)}
    </div>
  );
};
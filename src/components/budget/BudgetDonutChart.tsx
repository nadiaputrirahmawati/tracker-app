interface DonutSlice {
  name: string;
  percentage: number;
  color: string;
}

export function BudgetDonutChart({ data }: { data: DonutSlice[] }) {
  if (data.length === 0) {
    return (
      <div className="w-40 h-40 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
        Belum ada data
      </div>
    );
  }

  let accumulatedPercent = 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 42 42" className="w-36 h-36 -rotate-90">
      {data.map((slice, i) => {
        const strokeDasharray = `${(slice.percentage * circumference) / 100} ${circumference}`;
        const strokeDashoffset = -((accumulatedPercent * circumference) / 100);
        accumulatedPercent += slice.percentage;

        return (
          <circle
            key={i}
            cx="21"
            cy="21"
            r={radius}
            fill="transparent"
            stroke={slice.color}
            strokeWidth="7"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}
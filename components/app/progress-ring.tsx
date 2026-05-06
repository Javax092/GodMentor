export function ProgressRing({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex size-28 items-center justify-center">
      <svg className="-rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="rgb(96 165 250)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}%</p>
        <p className="text-xs text-muted-foreground">do mês</p>
      </div>
    </div>
  );
}

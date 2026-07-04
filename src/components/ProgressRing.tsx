type Props = {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  className?: string;
  trackClass?: string;
  ringClass?: string;
  labelClass?: string;
};

export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  className = "",
  trackClass = "text-indigo-100",
  ringClass = "text-indigo-600",
  labelClass = "fill-indigo-700",
}: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`Tiến độ ${v}%`}
      role="img"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        fill="none"
        stroke="currentColor"
        className={trackClass}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        stroke="currentColor"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={`${ringClass} transition-[stroke-dashoffset] duration-500`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className={`text-[10px] font-bold ${labelClass}`}
      >
        {v}%
      </text>
    </svg>
  );
}

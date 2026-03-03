interface Props {
  label: string;
  value: number;
  max?: number;
  color?: 'green' | 'yellow' | 'blue';
}

export default function RatingBar({ label, value, max = 10, color = 'green' }: Props) {
  const pct = Math.round((value / max) * 100);

  const trackColor =
    color === 'yellow'
      ? 'bg-ball'
      : color === 'blue'
      ? 'bg-blue-500'
      : 'bg-court';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${trackColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

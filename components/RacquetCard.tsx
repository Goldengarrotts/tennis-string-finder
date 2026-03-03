import Link from 'next/link';
import type { Racquet } from '@/types';

interface Props {
  racquet: Racquet;
  compact?: boolean;
}

const LEVEL_COLORS: Record<Racquet['level'], string> = {
  beginner: 'bg-green-50 text-green-700 border-green-200',
  intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
  advanced: 'bg-orange-50 text-orange-700 border-orange-200',
  pro: 'bg-red-50 text-red-700 border-red-200',
};

export default function RacquetCard({ racquet: r, compact = false }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{r.brand}</p>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{r.name}</h3>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${LEVEL_COLORS[r.level]}`}
        >
          {r.level}
        </span>
      </div>

      {/* Specs row */}
      <div className="grid grid-cols-3 gap-2">
        <Spec label="Head" value={`${r.headSize} in²`} />
        <Spec label="Weight" value={`${r.weight}g`} />
        <Spec label="Pattern" value={r.stringPattern} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Spec label="Balance" value={r.balance} />
        <Spec label="Tension" value={`${r.tensionMin}–${r.tensionMax} lb`} />
        <Spec label="Series" value={r.brand} />
      </div>

      {!compact && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{r.description}</p>
      )}

      <Link
        href={`/racquets/${r.slug}`}
        className="mt-auto text-center text-sm font-medium py-2 px-3 rounded-lg bg-court text-white hover:bg-court-dark transition-colors"
      >
        Racquet guide →
      </Link>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

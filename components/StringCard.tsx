import Link from 'next/link';
import type { TennisString } from '@/types';
import RatingBar from './RatingBar';

interface Props {
  string: TennisString;
  showRatings?: boolean;
  compact?: boolean;
  compareLink?: boolean;
}

const TYPE_LABELS: Record<TennisString['type'], string> = {
  polyester: 'Polyester',
  multifilament: 'Multifilament',
  'natural-gut': 'Natural Gut',
  'synthetic-gut': 'Synthetic Gut',
};

const TYPE_COLORS: Record<TennisString['type'], string> = {
  polyester: 'bg-blue-50 text-blue-700 border-blue-200',
  multifilament: 'bg-purple-50 text-purple-700 border-purple-200',
  'natural-gut': 'bg-amber-50 text-amber-700 border-amber-200',
  'synthetic-gut': 'bg-gray-50 text-gray-600 border-gray-200',
};

const PRICE_LABELS: Record<TennisString['priceBand'], string> = {
  budget: '£',
  mid: '££',
  premium: '£££',
};

export default function StringCard({ string: s, showRatings = false, compact = false, compareLink = false }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.brand}</p>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{s.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[s.type]}`}
          >
            {TYPE_LABELS[s.type]}
          </span>
          <span className="text-xs text-gray-400">{PRICE_LABELS[s.priceBand]}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Tag>{s.feel}</Tag>
        <Tag>{s.shape}</Tag>
        {s.armFriendly && <Tag green>Arm-friendly</Tag>}
        <Tag>{s.gauges.join(' / ')}</Tag>
      </div>

      {!compact && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{s.description}</p>
      )}

      {showRatings && (
        <div className="space-y-1.5 pt-1">
          <RatingBar label="Spin" value={s.ratings.spin} />
          <RatingBar label="Power" value={s.ratings.power} />
          <RatingBar label="Control" value={s.ratings.control} />
          <RatingBar label="Comfort" value={s.ratings.comfort} />
          <RatingBar label="Durability" value={s.ratings.durability} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          href={`/strings/${s.slug}`}
          className="flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg bg-court text-white hover:bg-court-dark transition-colors"
        >
          View details
        </Link>
        {compareLink && (
          <Link
            href={`/compare?strings=${s.slug}`}
            className="text-sm font-medium py-2 px-3 rounded-lg border border-gray-200 text-gray-600 hover:border-court hover:text-court transition-colors"
          >
            Compare
          </Link>
        )}
      </div>
    </div>
  );
}

function Tag({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
        green
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </span>
  );
}

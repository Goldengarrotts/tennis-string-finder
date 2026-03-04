import Link from 'next/link';
import RatingBar from './RatingBar';
import WhereToBuy from './WhereToBuy';
import type { Racquet, Recommendation, ResultLabel } from '@/types';
import type { Region } from '@/data/retailLinks';

// ─── Display maps ─────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  polyester: 'Polyester',
  multifilament: 'Multifilament',
  'natural-gut': 'Natural Gut',
  'synthetic-gut': 'Synthetic Gut',
};

const TYPE_COLORS: Record<string, string> = {
  polyester: 'bg-blue-50 text-blue-700',
  multifilament: 'bg-purple-50 text-purple-700',
  'natural-gut': 'bg-amber-50 text-amber-700',
  'synthetic-gut': 'bg-gray-100 text-gray-600',
};

const PRICE_LABELS: Record<string, string> = {
  budget: '£ Budget',
  mid: '££ Mid-range',
  premium: '£££ Premium',
};

/**
 * Visual config for each result label:
 *   header bar colour, badge colour, icon
 */
const LABEL_CONFIG: Record<
  ResultLabel,
  { headerBg: string; badgeBg: string; badgeText: string; icon: string }
> = {
  'Best overall match': {
    headerBg: 'bg-ball/20',
    badgeBg: 'bg-ball text-court',
    badgeText: 'text-court',
    icon: '🏆',
  },
  'Great alternative': {
    headerBg: 'bg-court/10',
    badgeBg: 'bg-court/15 text-court',
    badgeText: 'text-court',
    icon: '⭐',
  },
  'Budget option': {
    headerBg: 'bg-amber-50',
    badgeBg: 'bg-amber-100 text-amber-800',
    badgeText: 'text-amber-800',
    icon: '💰',
  },
  'Arm-friendly pick': {
    headerBg: 'bg-green-50',
    badgeBg: 'bg-green-100 text-green-800',
    badgeText: 'text-green-800',
    icon: '💪',
  },
  'Durability pick': {
    headerBg: 'bg-blue-50',
    badgeBg: 'bg-blue-100 text-blue-700',
    badgeText: 'text-blue-700',
    icon: '🔩',
  },
  'Strong match': {
    headerBg: 'bg-gray-50',
    badgeBg: 'bg-gray-100 text-gray-600',
    badgeText: 'text-gray-600',
    icon: '✓',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  rec: Recommendation;
  rank: number;
  racquet: Racquet | undefined;
  defaultRegion?: Region;
}

export default function WizardResultCard({ rec, rank, racquet, defaultRegion }: Props) {
  const s = rec.string;
  const cfg = LABEL_CONFIG[rec.label];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* ── Label bar ── */}
      <div className={`px-5 py-2.5 flex items-center justify-between gap-3 ${cfg.headerBg}`}>
        <div className="flex items-center gap-2">
          {/* Rank circle */}
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              rank === 1 ? 'bg-ball text-court' : 'bg-white/70 text-gray-600'
            }`}
          >
            {rank}
          </span>
          {/* Label badge */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badgeBg}`}>
            {cfg.icon} {rec.label}
          </span>
        </div>
        {/* Type badge */}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border border-transparent ${TYPE_COLORS[s.type]}`}
        >
          {TYPE_LABELS[s.type]}
        </span>
      </div>

      <div className="p-5">
        {/* ── String identity ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{s.brand}</p>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{PRICE_LABELS[s.priceBand]}</p>
          </div>
          {s.armFriendly && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full shrink-0 font-medium">
              Arm-friendly
            </span>
          )}
        </div>

        {/* ── Rating bars ── */}
        <div className="space-y-1.5 mb-5">
          <RatingBar label="Spin" value={s.ratings.spin} />
          <RatingBar label="Power" value={s.ratings.power} />
          <RatingBar label="Control" value={s.ratings.control} />
          <RatingBar label="Comfort" value={s.ratings.comfort} />
          <RatingBar label="Durability" value={s.ratings.durability} />
        </div>

        {/* ── Why this fits ── */}
        <div className="bg-court/5 border border-court/15 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-court uppercase tracking-wide mb-2">
            Why this fits
          </p>
          <ul className="space-y-1.5">
            {rec.reasons.map((reason, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-court shrink-0 mt-0.5" aria-hidden="true">
                  ✓
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Suggested tension ── */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Suggested tension
          </p>
          <p className="text-lg font-bold text-gray-900">
            {rec.suggestedTensionMin}–{rec.suggestedTensionMax} lb
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {s.type === 'polyester'
              ? 'Polys are strung lower than the label — they play stiffer than they feel.'
              : "Based on your racquet's recommended range."}
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2">
          <Link
            href={`/strings/${s.slug}`}
            className="flex-1 text-center text-sm font-medium py-2.5 rounded-lg bg-court text-white hover:bg-court-dark transition-colors"
          >
            Full string profile
          </Link>
          <Link
            href={`/compare?strings=${s.slug}`}
            className="text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-200 text-gray-600 hover:border-court hover:text-court transition-colors"
          >
            Compare
          </Link>
        </div>

        <WhereToBuy
          itemType="string"
          itemSlug={s.slug}
          itemName={`${s.brand} ${s.name}`}
          compact
          defaultRegion={defaultRegion}
        />
      </div>
    </div>
  );
}

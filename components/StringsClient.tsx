'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import StringCard from '@/components/StringCard';
import type { TennisString, StringType } from '@/types';

// ─── Type metadata ────────────────────────────────────────────────────────────
const TYPE_INFO: Record<StringType, { label: string; desc: string; icon: string }> = {
  polyester: {
    label: 'Polyester',
    icon: '🔵',
    desc: 'Maximum control and spin. Stiff and durable but hard on arms. Used by most touring pros.',
  },
  multifilament: {
    label: 'Multifilament',
    icon: '🟣',
    desc: 'Thousands of fibres mimicking natural gut. Comfortable, arm-friendly, and powerful.',
  },
  'natural-gut': {
    label: 'Natural Gut',
    icon: '🟡',
    desc: 'The gold standard. Best comfort, feel, and tension maintenance — but expensive.',
  },
  'synthetic-gut': {
    label: 'Synthetic Gut',
    icon: '⚪',
    desc: 'Solid all-rounders. Ideal for beginners and those wanting reliable, affordable strings.',
  },
};

const TYPES = Object.keys(TYPE_INFO) as StringType[];
const VALID_TYPES = new Set<string>(TYPES);

interface Props {
  strings: TennisString[];
}

export default function StringsClient({ strings }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const raw        = searchParams.get('type') ?? '';
  const activeType = VALID_TYPES.has(raw) ? (raw as StringType) : null;

  function handleFilter(type: StringType) {
    const next = type === activeType ? pathname : `${pathname}?type=${type}`;
    router.push(next, { scroll: false });
  }

  const filtered = activeType ? strings.filter((s) => s.type === activeType) : null;

  return (
    <>
      {/* Type filter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {TYPES.map((type) => {
          const info     = TYPE_INFO[type];
          const isActive = type === activeType;
          return (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              aria-pressed={isActive}
              className={`text-left w-full rounded-xl p-4 border transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court focus-visible:ring-offset-2
                ${
                  isActive
                    ? 'bg-court/5 border-court shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              <p className="text-2xl mb-2">{info.icon}</p>
              <p className={`font-semibold text-sm mb-1 ${isActive ? 'text-court' : 'text-gray-900'}`}>
                {info.label}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{info.desc}</p>
              {isActive && (
                <p className="text-xs text-court/70 mt-2 font-medium">Click to show all types ×</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Subhead when filtered */}
      {activeType && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium">
            {filtered!.length} {TYPE_INFO[activeType].label} string{filtered!.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            className="text-sm text-gray-400 hover:text-court transition-colors"
          >
            ← Show all types
          </button>
        </div>
      )}

      {/* Filtered: flat grid */}
      {activeType && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered!.map((s) => (
            <StringCard key={s.slug} string={s} showRatings compareLink />
          ))}
        </div>
      )}

      {/* Unfiltered: grouped sections */}
      {!activeType &&
        TYPES.map((type) => {
          const typeStrings = strings.filter((s) => s.type === type);
          if (typeStrings.length === 0) return null;
          const info = TYPE_INFO[type];
          return (
            <section key={type} className="mb-14">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  {info.icon} {info.label}
                </h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {typeStrings.length} strings
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {typeStrings.map((s) => (
                  <StringCard key={s.slug} string={s} showRatings compareLink />
                ))}
              </div>
            </section>
          );
        })}
    </>
  );
}

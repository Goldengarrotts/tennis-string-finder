import type { Metadata } from 'next';
import Link from 'next/link';
import { strings } from '@/data/strings';
import StringCard from '@/components/StringCard';
import StringTypeFilter, { STRING_TYPE_INFO } from '@/components/StringTypeFilter';
import type { StringType } from '@/types';

export const metadata: Metadata = {
  title: `Browse Tennis Strings — ${strings.length} Strings Reviewed`,
  description: `Browse our full database of ${strings.length} tennis strings. Filter by type, price, and arm-friendliness. Compare any 3 side by side.`,
};

const VALID_TYPES = new Set<string>([
  'polyester',
  'multifilament',
  'natural-gut',
  'synthetic-gut',
]);

export default async function StringsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType: StringType | null = VALID_TYPES.has(type ?? '')
    ? (type as StringType)
    : null;

  const displayStrings = activeType
    ? strings.filter((s) => s.type === activeType)
    : strings;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse strings</h1>
          <p className="text-gray-500 mt-1">
            {activeType
              ? `${displayStrings.length} ${STRING_TYPE_INFO[activeType].label} string${displayStrings.length !== 1 ? 's' : ''} — click the card again to clear`
              : `${strings.length} strings reviewed — find yours below.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/finder" className="btn-primary">
            Find my string →
          </Link>
          <Link href="/compare" className="btn-ghost border border-gray-200">
            Compare
          </Link>
        </div>
      </div>

      {/* Clickable type filter cards */}
      <StringTypeFilter activeType={activeType} />

      {/* String list */}
      {activeType ? (
        /* Filtered view: flat grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayStrings.map((s) => (
            <StringCard key={s.slug} string={s} showRatings compareLink />
          ))}
        </div>
      ) : (
        /* Default view: grouped sections by type */
        (Object.keys(STRING_TYPE_INFO) as StringType[]).map((type) => {
          const typeStrings = strings.filter((s) => s.type === type);
          if (typeStrings.length === 0) return null;
          const info = STRING_TYPE_INFO[type];
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
        })
      )}
    </div>
  );
}

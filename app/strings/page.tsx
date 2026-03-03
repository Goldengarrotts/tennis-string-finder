import type { Metadata } from 'next';
import Link from 'next/link';
import { strings } from '@/data/strings';
import StringCard from '@/components/StringCard';
import type { StringType, PriceBand } from '@/types';

export const metadata: Metadata = {
  title: 'Browse Tennis Strings — All 20 Strings Reviewed',
  description:
    'Browse our full database of 20 tennis strings. Filter by type, price, and arm-friendliness. Compare any 3 side by side.',
};

const TYPE_OPTIONS: { value: StringType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'polyester', label: 'Polyester' },
  { value: 'multifilament', label: 'Multifilament' },
  { value: 'natural-gut', label: 'Natural Gut' },
  { value: 'synthetic-gut', label: 'Synthetic Gut' },
];

export default function StringsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; price?: string; arm?: string; sort?: string }>;
}) {
  // Note: In Next.js 15+ searchParams is a Promise in server components
  // We'll handle this synchronously for the MVP
  return <StringsContent />;
}

function StringsContent() {
  // For MVP, show all strings with client-side filtering handled via static rendering
  const byType: Record<string, typeof strings> = {
    polyester: strings.filter((s) => s.type === 'polyester'),
    multifilament: strings.filter((s) => s.type === 'multifilament'),
    'natural-gut': strings.filter((s) => s.type === 'natural-gut'),
    'synthetic-gut': strings.filter((s) => s.type === 'synthetic-gut'),
  };

  const TYPE_INFO: Record<string, { label: string; desc: string; icon: string }> = {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse strings</h1>
          <p className="text-gray-500 mt-1">{strings.length} strings reviewed — find yours below.</p>
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

      {/* String type explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {Object.entries(TYPE_INFO).map(([type, info]) => (
          <div key={type} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl mb-2">{info.icon}</p>
            <p className="font-semibold text-gray-900 text-sm mb-1">{info.label}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{info.desc}</p>
          </div>
        ))}
      </div>

      {/* Sections by type */}
      {Object.entries(byType).map(([type, typeStrings]) => (
        <section key={type} className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {TYPE_INFO[type]?.icon} {TYPE_INFO[type]?.label}
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
      ))}
    </div>
  );
}

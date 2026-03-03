import type { Metadata } from 'next';
import { Suspense } from 'react';
import CompareTable from '@/components/CompareTable';

export const metadata: Metadata = {
  title: 'Compare Tennis Strings — Side-by-Side',
  description:
    'Compare up to 3 tennis strings side by side on spin, power, control, comfort, and durability. Shareable URL for easy comparison.',
};

interface Props {
  searchParams: Promise<{ strings?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const { strings: stringParam } = await searchParams;
  const slugs = stringParam ? stringParam.split(',').filter(Boolean) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare strings</h1>
        <p className="text-gray-500">
          Add up to 3 strings to compare side by side. The URL updates automatically — bookmark or share it.
        </p>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-sm">
        <Tip icon="🟢" title="Best value highlighted" desc="We highlight the top-rated attribute across the strings you're comparing." />
        <Tip icon="🔗" title="Shareable URL" desc="The URL updates as you add/remove strings. Copy and share with your coach or friends." />
        <Tip icon="⚖️" title="Up to 3 strings" desc="Compare any combination of strings from our database of 20." />
      </div>

      <Suspense fallback={<div className="text-gray-400 py-12 text-center">Loading comparison…</div>}>
        <CompareTable initialSlugs={slugs} />
      </Suspense>
    </div>
  );
}

function Tip({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-lg mb-1">{icon}</p>
      <p className="font-semibold text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
    </div>
  );
}

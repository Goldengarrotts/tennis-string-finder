import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { racquets, getRacquetBySlug } from '@/data/racquets';
import { strings, getStringsBySlugs } from '@/data/strings';
import StringCard from '@/components/StringCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return racquets.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getRacquetBySlug(slug);
  if (!r) return {};
  return {
    title: `${r.brand} ${r.name} — String Guide, Tension & Recommendations`,
    description: `${r.description.slice(0, 120)}… Find the best strings for the ${r.name}.`,
  };
}

const LEVEL_DESC: Record<string, string> = {
  beginner: 'Great for players starting out — forgiving and easy to use.',
  intermediate: 'Suits club players with a developing technique.',
  advanced: 'Demands clean ball-striking; rewards precision and consistency.',
  pro: 'Tour-level performance for the most technically accomplished players.',
};

export default async function RacquetDetailPage({ params }: Props) {
  const { slug } = await params;
  const r = getRacquetBySlug(slug);
  if (!r) notFound();

  const recommendedStrings = r.recommendedStrings
    ? getStringsBySlugs(r.recommendedStrings)
    : [];

  const isDense = parseInt(r.stringPattern.split('x')[1] ?? '0', 10) >= 20;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8 flex gap-2">
        <Link href="/racquets" className="hover:text-court">Racquets</Link>
        <span>/</span>
        <span className="text-gray-700">{r.brand} {r.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-semibold text-court uppercase tracking-wide mb-1">{r.brand}</p>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{r.name}</h1>
            <span className="inline-block text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize mb-4">
              {r.level} level
            </span>
            <p className="text-gray-600 leading-relaxed text-lg">{r.description}</p>
            <p className="text-sm text-gray-500 mt-3 italic">{LEVEL_DESC[r.level]}</p>
          </div>

          {/* Tension guidance */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Tension guidance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <TensionBox
                label="Manufacturer range"
                value={`${r.tensionMin}–${r.tensionMax} lb`}
                sub="Always stay within this range"
              />
              <TensionBox
                label="Poly recommendation"
                value={`${r.tensionMin - 3}–${Math.round((r.tensionMin + r.tensionMax) / 2) - 2} lb`}
                sub="String ~10% lower for polys"
              />
              <TensionBox
                label="Gut / Multi recommendation"
                value={`${r.tensionMin}–${r.tensionMax} lb`}
                sub="Full manufacturer range OK"
              />
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Lower tension</strong> (near {r.tensionMin} lb): more power, more comfort, more spin potential.
                Good for players who generate their own control.
              </p>
              <p>
                <strong>Higher tension</strong> (near {r.tensionMax} lb): more control, firmer feel, slightly less power.
                Good for big hitters who want to keep the ball in.
              </p>
              {isDense && (
                <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700">
                  ⚠️ Your {r.stringPattern} dense pattern already reduces spin potential. Consider a thinner gauge or spin-oriented string to compensate.
                </p>
              )}
            </div>
          </div>

          {/* String pattern */}
          <div className="bg-court/5 border border-court/20 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">
              String pattern: {r.stringPattern} {isDense ? '(dense)' : '(open)'}
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              {isDense
                ? `The ${r.stringPattern} pattern gives you exceptional control and consistency. The tighter string bed creates a firmer, more predictable response — ideal for precision players. Your strings won't generate as much spin on their own, so consider a sharper-shaped poly to compensate.`
                : `The ${r.stringPattern} pattern is ideal for spin and power. The wider spacing lets the strings bite into the ball more easily and snap back to generate topspin. A great canvas for both spin-oriented polys and powerful multifilaments.`}
            </p>
          </div>

          {/* Recommended strings */}
          {recommendedStrings.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Recommended strings for this racquet</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedStrings.map((s) => (
                  <StringCard key={s.slug} string={s} compact compareLink />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Specs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Technical specs</h3>
            <dl className="space-y-3 text-sm">
              <SpecRow label="Head size" value={`${r.headSize} in²`} />
              <SpecRow label="Weight" value={`${r.weight}g unstrung`} />
              <SpecRow label="Balance" value={r.balance === 'HH' ? 'Head-heavy' : r.balance === 'HL' ? 'Head-light' : 'Even'} />
              <SpecRow label="String pattern" value={r.stringPattern} />
              <SpecRow label="Tension range" value={`${r.tensionMin}–${r.tensionMax} lb`} />
              <SpecRow label="Level" value={r.level} />
            </dl>
          </div>

          {/* CTA */}
          <Link
            href={`/finder?racquet=${r.slug}`}
            className="block w-full text-center btn-primary py-3"
          >
            🎾 Find strings for this racquet
          </Link>

          {/* Browse strings */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">Want to explore all strings?</p>
            <Link href="/strings" className="text-court font-semibold text-sm hover:underline">
              Browse all 20 strings →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TensionBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900 capitalize text-right">{value}</dd>
    </div>
  );
}

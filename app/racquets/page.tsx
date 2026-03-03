import type { Metadata } from 'next';
import Link from 'next/link';
import { racquets } from '@/data/racquets';
import RacquetCard from '@/components/RacquetCard';

export const metadata: Metadata = {
  title: 'Racquet Guide — Find Your Frame & Best String Pairings',
  description:
    'Browse 10 popular racquets with tension guides, string pattern info, and string recommendations for each frame.',
};

export default function RacquetsPage() {
  const byBrand: Record<string, typeof racquets> = {};
  for (const r of racquets) {
    if (!byBrand[r.brand]) byBrand[r.brand] = [];
    byBrand[r.brand].push(r);
  }

  const levelOrder = ['beginner', 'intermediate', 'advanced', 'pro'];
  const sortedRacquets = [...racquets].sort(
    (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Racquet guide</h1>
        <p className="text-gray-500 text-lg">
          {racquets.length} popular frames with tension ranges, string patterns, and recommended strings.
        </p>
      </div>

      {/* Pattern explainer */}
      <div className="bg-court/5 border border-court/20 rounded-xl p-6 mb-10">
        <h2 className="font-bold text-gray-900 mb-3">💡 String pattern explained</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-1">Open patterns (e.g. 16×19, 16×18)</p>
            <p className="text-gray-500 leading-relaxed">
              More space between strings = more ball bite = more spin. Also plays with a bit more power. Best for spin seekers and baseliners.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Dense patterns (e.g. 18×20)</p>
            <p className="text-gray-500 leading-relaxed">
              Tighter string bed = more control and precision, slightly less spin. String generates its own spin less easily. Best for flat hitters and control-first players.
            </p>
          </div>
        </div>
      </div>

      {/* All racquets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRacquets.map((r) => (
          <RacquetCard key={r.slug} racquet={r} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-court text-white rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Know your racquet?</h2>
        <p className="text-green-200 mb-5">Use the String Finder to get personalised string recommendations in under 60 seconds.</p>
        <Link href="/finder" className="bg-ball text-court font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all inline-block">
          Find my string →
        </Link>
      </div>
    </div>
  );
}

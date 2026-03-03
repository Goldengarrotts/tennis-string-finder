import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { racquets, getRacquetBySlug } from '@/data/racquets';
import { strings } from '@/data/strings';
import type { TennisString, Racquet, StringType } from '@/types';
import RatingBar from '@/components/RatingBar';
import WhereToBuy from '@/components/WhereToBuy';
import BestStringsTypeFilter from '@/components/BestStringsTypeFilter';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com').replace(/\/$/, '');

const VALID_TYPES = new Set(['polyester', 'multifilament', 'natural-gut', 'synthetic-gut']);

// ─── Display maps ─────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<StringType, string> = {
  polyester:      'Polyester',
  multifilament:  'Multifilament',
  'natural-gut':  'Natural Gut',
  'synthetic-gut': 'Synthetic Gut',
};

const TYPE_COLORS: Record<StringType, string> = {
  polyester:      'bg-blue-50 text-blue-700 border-blue-200',
  multifilament:  'bg-purple-50 text-purple-700 border-purple-200',
  'natural-gut':  'bg-amber-50 text-amber-700 border-amber-200',
  'synthetic-gut': 'bg-gray-50 text-gray-600 border-gray-200',
};

const PRICE_LABELS: Record<string, string> = { budget: '£', mid: '££', premium: '£££' };

// ─── Scoring ──────────────────────────────────────────────────────────────────
function isDense(r: Racquet) {
  return parseInt(r.stringPattern.split('x')[1] ?? '0', 10) >= 20;
}

function isStiff(r: Racquet) {
  return (r.stiffnessRA ?? 64) >= 65;
}

function scoreString(s: TennisString, r: Racquet): number {
  let score = 0;

  // Explicitly curated picks get a large head-start
  if (r.recommendedStrings?.includes(s.slug)) score += 5;

  // Control always valued; spin weighted by pattern density
  score += s.ratings.control * 0.25;
  score += s.ratings.spin * (isDense(r) ? 0.30 : 0.15);

  // Stiff frames: comfort and arm-friendliness matter more
  if (isStiff(r)) {
    score += s.ratings.comfort * 0.20;
    if (s.armFriendly) score += 1;
    if (s.type === 'polyester' && !s.armFriendly) score -= 0.8;
  }

  // Player level weighting
  if (r.level === 'advanced' || r.level === 'pro') {
    score += s.ratings.control * 0.10 + s.ratings.durability * 0.10;
  } else {
    score += s.ratings.power * 0.10 + s.ratings.comfort * 0.15;
  }

  score += s.ratings.durability * 0.05;
  return score;
}

function buildReasons(s: TennisString, r: Racquet): string[] {
  const reasons: string[] = [];

  if (r.recommendedStrings?.includes(s.slug)) {
    reasons.push(`An editorial top pick for the ${r.name}`);
  }
  if (s.ratings.control >= 8) {
    reasons.push(`Exceptional control (${s.ratings.control}/10) — rewards a precision frame`);
  } else if (s.ratings.control >= 6) {
    reasons.push(`Solid control (${s.ratings.control}/10) complements this racquet`);
  }
  if (isDense(r) && s.ratings.spin >= 8) {
    reasons.push(`High spin (${s.ratings.spin}/10) compensates for the ${r.stringPattern} dense pattern`);
  } else if (!isDense(r) && s.ratings.spin >= 7) {
    reasons.push(`Open ${r.stringPattern} pattern amplifies spin (${s.ratings.spin}/10)`);
  }
  if (isStiff(r) && s.armFriendly) {
    reasons.push(`Arm-friendly — softens the vibration of this ${r.stiffnessRA} RA frame`);
  }
  if (s.ratings.comfort >= 8) {
    reasons.push(`High comfort (${s.ratings.comfort}/10) — plays plush for a ${s.type}`);
  }
  if (s.type === 'natural-gut') {
    reasons.push('Natural gut delivers unmatched feel and tension maintenance in any frame');
  }
  if (s.ratings.durability >= 8) {
    reasons.push(`Durable (${s.ratings.durability}/10) — fewer restrings`);
  }
  if (s.priceBand === 'budget') {
    reasons.push('Great value — strong performance without the premium price');
  }

  return reasons.slice(0, 3);
}

function getTension(s: TennisString, r: Racquet) {
  if (s.type === 'polyester') {
    const adj = Math.round((r.tensionMax - r.tensionMin) * 0.15);
    return { min: r.tensionMin - adj, max: r.tensionMax - adj };
  }
  return { min: r.tensionMin, max: r.tensionMax };
}

function buildIntro(r: Racquet): string {
  const dense = isDense(r);
  const stiff = isStiff(r);
  const parts: string[] = [];

  parts.push(
    `The ${r.brand} ${r.name} is a ${r.level}-level racquet` +
    (r.stiffnessRA ? ` with a stiffness rating of ${r.stiffnessRA} RA` : '') + '.',
  );

  parts.push(
    dense
      ? `Its ${r.stringPattern} dense pattern prioritises control and consistency, but limits spin generation — making string selection particularly important.`
      : `With an open ${r.stringPattern} pattern this frame is versatile, letting strings snap back freely for extra topspin.`,
  );

  if (stiff) {
    parts.push(
      'The stiffer frame transmits more shock, so arm-friendly or multifilament strings are worth considering alongside polys.',
    );
  }

  parts.push(
    r.level === 'advanced' || r.level === 'pro'
      ? 'Our picks lean toward feel, control, and feedback for advanced technique.'
      : r.level === 'beginner'
      ? 'Our picks emphasise comfort and power to help develop your game quickly.'
      : 'The recommendations balance performance and comfort for club-level play.',
  );

  return parts.join(' ');
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return racquets.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = getRacquetBySlug(slug);
  if (!r) return {};

  const title = `Best Strings for ${r.brand} ${r.name} (Guide + Recommendations)`;
  const description =
    `Discover the best tennis strings for the ${r.brand} ${r.name}. ` +
    `Expert recommendations, tension guidance by string type, and a full breakdown of why each string suits this ${r.level}-level racquet.`;
  const url = `${BASE_URL}/racquets/${slug}/best-strings`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article' },
    robots: { index: true, follow: true },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BestStringsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug } = await params;
  const { type }  = await searchParams;

  const r = getRacquetBySlug(slug);
  if (!r) notFound();

  const activeType: StringType | null = VALID_TYPES.has(type ?? '')
    ? (type as StringType)
    : null;

  // Rank all 40 strings for this racquet
  const allRanked = strings
    .map((s) => ({ string: s, score: scoreString(s, r) }))
    .sort((a, b) => b.score - a.score);

  // Filtered view: top 6 of active type; unfiltered: top 6 overall
  const displayRecs = activeType
    ? allRanked.filter(({ string }) => string.type === activeType).slice(0, 6)
    : allRanked.slice(0, 6);

  // 8 other racquets for the cross-links section
  const popularRacquets = racquets.filter((r2) => r2.slug !== r.slug).slice(0, 8);

  const intro   = buildIntro(r);
  const dense   = isDense(r);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8 flex gap-2 flex-wrap" aria-label="Breadcrumb">
        <Link href="/racquets" className="hover:text-court">Racquets</Link>
        <span>/</span>
        <Link href={`/racquets/${r.slug}`} className="hover:text-court">
          {r.brand} {r.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700">Best Strings</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Hero */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              Best Strings for {r.brand} {r.name}
            </h1>
            <p className="text-gray-600 leading-relaxed text-lg">{intro}</p>
          </div>

          {/* Type filter + recommendation cards */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {activeType
                  ? `${TYPE_LABELS[activeType]} picks`
                  : 'Top string recommendations'}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({displayRecs.length} strings)
                </span>
              </h2>
              <BestStringsTypeFilter activeType={activeType} />
            </div>

            {displayRecs.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">
                No {activeType ? TYPE_LABELS[activeType] : ''} strings in our database yet.{' '}
                <Link href={`/racquets/${r.slug}/best-strings`} className="text-court underline">
                  Show all types
                </Link>
              </p>
            ) : (
              <div className="space-y-6">
                {displayRecs.map(({ string }, i) => {
                  const reasons = buildReasons(string, r);
                  const tension = getTension(string, r);

                  return (
                    <article
                      key={string.slug}
                      className="bg-white border border-gray-200 rounded-xl p-6"
                    >
                      {/* String header */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                          {i === 0 && !activeType && (
                            <span className="inline-block text-xs font-bold px-2 py-0.5 bg-ball text-court rounded-full mb-1.5">
                              #1 Pick
                            </span>
                          )}
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            {string.brand}
                          </p>
                          <h3 className="font-bold text-gray-900 text-xl leading-tight">
                            <Link
                              href={`/strings/${string.slug}`}
                              className="hover:text-court transition-colors"
                            >
                              {string.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[string.type]}`}
                          >
                            {TYPE_LABELS[string.type]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {PRICE_LABELS[string.priceBand]}
                          </span>
                        </div>
                      </div>

                      {/* Ratings + reasons grid */}
                      <div className="grid sm:grid-cols-2 gap-6 mb-5">
                        {/* Ratings */}
                        <div className="space-y-2">
                          <RatingBar label="Spin"       value={string.ratings.spin} />
                          <RatingBar label="Power"      value={string.ratings.power} />
                          <RatingBar label="Control"    value={string.ratings.control} />
                          <RatingBar label="Comfort"    value={string.ratings.comfort} />
                          <RatingBar label="Durability" value={string.ratings.durability} />
                        </div>

                        {/* Why it works */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Why it works for the {r.name}
                          </h4>
                          <ul className="space-y-1.5">
                            {reasons.map((reason, j) => (
                              <li key={j} className="flex gap-2 text-sm text-gray-700">
                                <span className="text-court font-bold shrink-0 mt-0.5">✓</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-gray-400 mt-3">
                            Suggested tension:{' '}
                            <span className="font-semibold text-gray-600">
                              {tension.min}–{tension.max} lb
                            </span>
                            {string.type === 'polyester' && (
                              <span className="text-gray-400"> (strung lower than label)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Compact where-to-buy for this string */}
                      <WhereToBuy
                        itemType="string"
                        itemSlug={string.slug}
                        itemName={`${string.brand} ${string.name}`}
                        compact
                      />
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tension guidance */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">
              Tension guidance for the {r.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <TensionBox
                label="Manufacturer range"
                value={`${r.tensionMin}–${r.tensionMax} lb`}
                sub="Never exceed this"
              />
              <TensionBox
                label="Polyester strings"
                value={`${r.tensionMin - 3}–${r.tensionMax - 3} lb`}
                sub="String 3–5 lb lower for polys"
              />
              <TensionBox
                label="Multi / Gut / Syn Gut"
                value={`${r.tensionMin}–${r.tensionMax} lb`}
                sub="Full range — go by feel"
              />
            </div>
            <p className="text-xs text-gray-400 italic leading-relaxed">
              General guidance only — not professional advice. Tension preference is personal and varies
              by playing style. Always stay within the manufacturer&apos;s recommended range.
              {isDense(r) && (
                <span>
                  {' '}The dense {r.stringPattern} pattern plays stiffer, so many players prefer
                  the lower end of the range.
                </span>
              )}
            </p>
          </section>

          {/* Internal links */}
          <section className="bg-court/5 border border-court/20 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Explore further</h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={`/racquets/${r.slug}`}
                  className="text-court hover:underline font-medium text-sm"
                >
                  {r.brand} {r.name} — full specs, tension guide &amp; stringing tips →
                </Link>
              </li>
              <li>
                <Link
                  href="/strings"
                  className="text-court hover:underline font-medium text-sm"
                >
                  Browse all {strings.length} strings in the database →
                </Link>
              </li>
              {displayRecs.slice(0, 4).map(({ string }) => (
                <li key={string.slug}>
                  <Link
                    href={`/strings/${string.slug}`}
                    className="text-court hover:underline font-medium text-sm"
                  >
                    {string.brand} {string.name} — full review, ratings &amp; where to buy →
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Popular racquets cross-links */}
          <section>
            <h2 className="font-bold text-gray-900 mb-5">
              Best strings for other popular racquets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularRacquets.map((r2) => (
                <Link
                  key={r2.slug}
                  href={`/racquets/${r2.slug}/best-strings`}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:border-court/40 hover:bg-court/5 transition-colors"
                >
                  <p className="text-xs text-gray-400">{r2.brand}</p>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{r2.name}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="space-y-5">
          {/* Racquet WhereToBuy */}
          <WhereToBuy
            itemType="racquet"
            itemSlug={r.slug}
            itemName={`${r.brand} ${r.name}`}
          />

          {/* Quick specs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Quick specs</h3>
            <dl className="space-y-3 text-sm">
              <SpecRow
                label="Pattern"
                value={`${r.stringPattern} ${dense ? '(dense)' : '(open)'}`}
              />
              <SpecRow label="Head size"   value={`${r.headSize} in²`} />
              <SpecRow label="Weight"      value={`${r.weight}g strung`} />
              {r.stiffnessRA && (
                <SpecRow label="Stiffness" value={`${r.stiffnessRA} RA`} />
              )}
              <SpecRow label="Tension"     value={`${r.tensionMin}–${r.tensionMax} lb`} />
              <SpecRow label="Level"       value={r.level} />
            </dl>
          </div>

          {/* Link to full racquet detail page */}
          <Link
            href={`/racquets/${r.slug}`}
            className="block w-full text-center text-sm font-medium py-3 rounded-xl border border-gray-200 text-gray-700 hover:border-court hover:text-court transition-colors"
          >
            Full {r.name} review →
          </Link>

          {/* Finder CTA */}
          <Link
            href={`/finder?racquet=${r.slug}`}
            className="block w-full text-center btn-primary py-3"
          >
            🎾 Personalised recommendation
          </Link>
        </aside>
      </div>
    </div>
  );
}

// ─── Small helper components ──────────────────────────────────────────────────
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
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="font-medium text-gray-900 capitalize text-right">{value}</dd>
    </div>
  );
}

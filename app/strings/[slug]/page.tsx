import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { strings, getStringBySlug } from '@/data/strings';
import { racquets } from '@/data/racquets';
import RatingBar from '@/components/RatingBar';
import WhereToBuy from '@/components/WhereToBuy';
import { detectRegion } from '@/lib/detectRegion';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return strings.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getStringBySlug(slug);
  if (!s) return {};
  return {
    title: `${s.brand} ${s.name} Review — Specs, Ratings & Pairings`,
    description: s.description.slice(0, 155),
  };
}

const TYPE_LABELS: Record<string, string> = {
  polyester: 'Polyester',
  multifilament: 'Multifilament',
  'natural-gut': 'Natural Gut',
  'synthetic-gut': 'Synthetic Gut',
};

const PRICE_LABELS: Record<string, string> = {
  budget: '£ Budget',
  mid: '££ Mid-range',
  premium: '£££ Premium',
};

export default async function StringDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = getStringBySlug(slug);
  if (!s) notFound();

  const defaultRegion = await detectRegion();

  const pairings = getPairings(s.type);
  const similar = strings
    .filter((x) => x.slug !== s.slug && x.type === s.type)
    .slice(0, 3);
  const worksIn = racquets
    .filter((r) => r.recommendedStrings?.includes(s.slug))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8 flex gap-2">
        <Link href="/strings" className="hover:text-court">Strings</Link>
        <span>/</span>
        <span className="text-gray-700">{s.brand} {s.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-semibold text-court uppercase tracking-wide mb-1">{s.brand}</p>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{s.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>{TYPE_LABELS[s.type]}</Badge>
              <Badge>{PRICE_LABELS[s.priceBand]}</Badge>
              <Badge>{s.feel} feel</Badge>
              <Badge>{s.shape} shape</Badge>
              {s.armFriendly && <Badge green>Arm-friendly</Badge>}
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">{s.description}</p>
          </div>

          {/* Ratings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Performance ratings</h2>
            <div className="space-y-3">
              <RatingBar label="Spin" value={s.ratings.spin} />
              <RatingBar label="Power" value={s.ratings.power} />
              <RatingBar label="Control" value={s.ratings.control} />
              <RatingBar label="Comfort" value={s.ratings.comfort} />
              <RatingBar label="Durability" value={s.ratings.durability} />
            </div>
          </div>

          {/* Where to buy */}
          <WhereToBuy itemType="string" itemSlug={s.slug} itemName={`${s.brand} ${s.name}`} defaultRegion={defaultRegion} />

          {/* Why this pick */}
          <div className="bg-court/5 border border-court/20 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Why choose this string?</h2>
            <ul className="space-y-3">
              {s.whyPick.map((reason, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="text-court font-bold mt-0.5">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hybrid pairings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-2">Recommended pairings</h2>
            <p className="text-sm text-gray-500 mb-4">{pairings.intro}</p>
            <div className="space-y-3">
              {pairings.combos.map((c) => (
                <div key={c.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Similar strings */}
          {similar.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Similar {TYPE_LABELS[s.type]} strings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similar.map((x) => (
                  <Link
                    key={x.slug}
                    href={`/strings/${x.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs text-gray-400">{x.brand}</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{x.name}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                      <p>Spin: {x.ratings.spin}/10</p>
                      <p>Comfort: {x.ratings.comfort}/10</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Specs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Specs at a glance</h3>
            <dl className="space-y-3 text-sm">
              <SpecRow label="Type" value={TYPE_LABELS[s.type]} />
              <SpecRow label="Feel" value={s.feel} />
              <SpecRow label="Shape" value={s.shape} />
              <SpecRow label="Gauges" value={s.gauges.join(', ')} />
              <SpecRow label="Arm-friendly" value={s.armFriendly ? '✓ Yes' : '✗ No'} />
              <SpecRow label="Price band" value={PRICE_LABELS[s.priceBand]} />
            </dl>
          </div>

          {/* Score summary */}
          <div className="bg-court text-white rounded-xl p-5">
            <h3 className="font-bold mb-3">Overall snapshot</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(s.ratings).map(([key, val]) => (
                <div key={key} className="bg-white/10 rounded-lg px-3 py-2 text-center">
                  <p className="text-2xl font-bold text-ball">{val}</p>
                  <p className="text-xs text-green-200 capitalize">{key}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={`/compare?strings=${s.slug}`}
              className="block w-full text-center btn-primary py-3"
            >
              ⚖️ Compare this string
            </Link>
            <Link
              href="/finder"
              className="block w-full text-center btn-ghost border border-gray-200 py-3"
            >
              🎾 Find strings for my racquet
            </Link>
          </div>

          {/* Works great in */}
          {worksIn.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Works great in</h3>
              <div className="space-y-2">
                {worksIn.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/racquets/${r.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-court/5 border border-transparent hover:border-court/20 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{r.brand}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                    </div>
                    <span className="text-xs text-court font-semibold ml-2 shrink-0">View →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Affiliate notice */}
          <p className="text-xs text-gray-400 leading-relaxed">
            * Some links on this page may be affiliate links.{' '}
            <Link href="/disclosure" className="underline">Learn more.</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

function Badge({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <span
      className={`text-sm px-3 py-1 rounded-full border capitalize ${
        green
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-gray-100 text-gray-600 border-gray-200'
      }`}
    >
      {children}
    </span>
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

function getPairings(type: string) {
  if (type === 'polyester') {
    return {
      intro:
        'Polys pair beautifully with natural gut or multifilament crosses for the classic hybrid setup — more comfort without losing control.',
      combos: [
        {
          icon: '🌿',
          label: 'Poly mains + Natural Gut crosses',
          desc: 'The "Federer setup." Maximum feel and comfort from gut, maximum control from poly. Expensive but unbeatable.',
        },
        {
          icon: '🟣',
          label: 'Poly mains + Multifilament crosses',
          desc: 'Budget-friendly hybrid. Softer and more arm-friendly than full poly without the gut price tag.',
        },
        {
          icon: '🔵',
          label: 'Full poly (same string)',
          desc: 'Consistent feel throughout. Best durability and control. Ideal if your arm handles it well.',
        },
      ],
    };
  }
  if (type === 'natural-gut') {
    return {
      intro:
        'Natural gut is best as main strings where you feel it most — paired with a poly cross for durability and control.',
      combos: [
        {
          icon: '🔵',
          label: 'Gut mains + Poly crosses',
          desc: 'The premier hybrid. Gut gives you comfort and feel; poly gives you control, spin, and longevity.',
        },
        {
          icon: '🌿',
          label: 'Full natural gut',
          desc: 'The ultimate comfort and feel setup. Expensive but unmatched. Preferred by classic serve-and-volley players.',
        },
      ],
    };
  }
  if (type === 'multifilament') {
    return {
      intro:
        'Multifilaments work brilliantly as full setups or as crosses in a gut-style hybrid for arm-sensitive players.',
      combos: [
        {
          icon: '🟣',
          label: 'Full multifilament',
          desc: 'Comfortable, arm-friendly, and lively. Great for beginners, seniors, and those recovering from arm injuries.',
        },
        {
          icon: '🔵',
          label: 'Multi mains + Poly crosses',
          desc: 'Adds spin bite and control to a comfortable setup. Good middle ground between full multi and full poly.',
        },
      ],
    };
  }
  return {
    intro: 'Synthetic gut works well as a full setup or as a starter setup before moving to more specialised strings.',
    combos: [
      {
        icon: '⚪',
        label: 'Full synthetic gut',
        desc: 'Reliable, affordable, and comfortable. The classic club player setup.',
      },
      {
        icon: '🟣',
        label: 'Upgrade to multifilament',
        desc: 'When you want more comfort and power, multifilaments are the natural next step.',
      },
    ],
  };
}

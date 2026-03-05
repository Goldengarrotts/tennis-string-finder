import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { strings } from '@/data/strings';
import StringCard from '@/components/StringCard';
import SectionHeader from '@/components/SectionHeader';
import FeatureCard from '@/components/FeatureCard';
import RacquetDepotSidebarPromo from '@/components/RacquetDepotSidebarPromo';

export const metadata: Metadata = {
  title: 'TennisStringFinder — Tennis String Finder & Comparison',
  description:
    'Not sure what tennis string to use? Answer 4 quick questions about your racquet and playing goals, and get personalised string recommendations with clear, jargon-free explanations.',
};

// ─── Data ────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: '🎾',
    title: 'Pick your racquet',
    desc: 'Select your frame and we factor in string pattern, head size, and tension range.',
  },
  {
    step: '2',
    icon: '🎯',
    title: 'Choose your goals',
    desc: 'Tell us whether you prioritise spin, power, control, comfort, or durability.',
  },
  {
    step: '3',
    icon: '⚙️',
    title: 'Set your preferences',
    desc: 'Let us know about arm sensitivity and whether you want hybrid setups.',
  },
  {
    step: '4',
    icon: '🏆',
    title: 'Get your top 3 strings',
    desc: 'Receive personalised recommendations with plain-English explanations.',
  },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Racquet-first recommendations',
    desc: 'Tell us your racquet and we factor in string pattern, head size, and tension range.',
  },
  {
    icon: '⚖️',
    title: 'Side-by-side comparison',
    desc: 'Compare up to 3 strings on spin, power, control, comfort, and durability.',
  },
  {
    icon: '💬',
    title: 'Plain-English explanations',
    desc: 'No jargon. We tell you why each string suits you, in terms anyone can understand.',
  },
  {
    icon: '💪',
    title: 'Arm-safety filter',
    desc: 'Struggling with tennis elbow? We flag and deprioritise strings that are hard on your arm.',
  },
];

// RPM Blast, ALU Power, Hyper-G, Tour Bite — the iconic four
const POPULAR_SLUGS = [
  'babolat-rpm-blast',
  'luxilon-alu-power',
  'solinco-hyper-g',
  'solinco-tour-bite',
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const popular = POPULAR_SLUGS.map((slug) => strings.find((s) => s.slug === slug)).filter(Boolean);

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════════════════════
          Two-column layout on desktop: copy left, racquet illustration right.
          Primary CTA (ball yellow) dominates; secondary is a ghost button.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-court text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-28 grid md:grid-cols-2 gap-8 md:gap-16 items-center">

          {/* Left: copy */}
          <div>
            {/* Eyebrow label */}
            <span className="inline-flex items-center gap-2 bg-white/10 text-ball text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <span aria-hidden="true">🎾</span> The tennis string guide
            </span>

            {/* Headline — strong typographic hierarchy */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-5 text-white">
              <span className="text-ball">Find the string{' '}</span>
              your game deserves.
            </h1>

            {/* Subheadline */}
            <p className="text-green-200 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
              Answer 4 quick questions about your racquet and playing goals. Get personalised
              recommendations with clear, jargon-free explanations.
            </p>

            {/* CTAs: primary dominant, secondary ghost */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/finder"
                className="inline-flex items-center justify-center gap-2 bg-ball text-court font-bold px-8 py-4 rounded-xl text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
              >
                Find my string
                {/* Arrow icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/strings"
                className="inline-flex items-center justify-center border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                Browse all strings
              </Link>
            </div>

            {/* Light trust signal */}
            <p className="text-green-300/60 text-sm mt-6">40+ strings reviewed &middot; Free to use</p>
          </div>

          {/* Right: hero photograph
              - Stacks below text on mobile, sits beside it on md+
              - Court-green overlay blends the photo with site branding
              - Next.js Image handles WebP conversion, lazy loading, and sizing */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
            <Image
              src="/images/herotennis.png"
              alt="Tennis ball striking racquet strings on a court"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Dark court-green overlay at 40% opacity to tie the photo into the hero palette */}
            <div className="absolute inset-0 bg-[#1e5c3a]/40" />
          </div>

        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════
          4 equal cards, each with: step badge, icon, title, description.
          Cards have soft shadow + rounded corners for a clean, modern look.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">

          <SectionHeader
            label="The process"
            title="How it works"
            subtitle="Four quick steps to your perfect string."
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-10">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3"
              >
                {/* Icon + step badge row */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                  <span className="text-xs font-bold text-court bg-court/10 px-2.5 py-1 rounded-full">
                    Step {step}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Secondary CTA below the cards */}
          <div className="text-center mt-10">
            <Link
              href="/finder"
              className="inline-flex items-center gap-2 bg-court text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-court-dark transition-colors shadow-sm"
            >
              Start the finder
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ POPULAR STRINGS ═══════════════════════════════════════════════════
          Cream background breaks up the white sections.
          showRatings + compact keeps cards tidy but informative.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">

          {/* Header row with inline "browse all" link on desktop */}
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              title="Popular strings"
              subtitle="The most-played strings on tour and at clubs worldwide."
            />
            <Link
              href="/strings"
              className="text-court font-semibold text-sm hover:underline hidden sm:block shrink-0 mb-0.5"
            >
              Browse all strings →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popular.map((s) => s && (
              <StringCard key={s.slug} string={s} showRatings compact compareLink />
            ))}
          </div>

          {/* Mobile fallback link */}
          <div className="text-center mt-6 sm:hidden">
            <Link href="/strings" className="btn-ghost">Browse all strings →</Link>
          </div>
        </div>
      </section>

      {/* ══ PARTNER OFFER ════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <RacquetDepotSidebarPromo placement="homepage_inline" />
        </div>
      </section>

      {/* ══ WHY STRINGLAB ═════════════════════════════════════════════════════
          2×2 feature grid using the reusable FeatureCard component.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <SectionHeader
            title="Why TennisStringFinder?"
            subtitle="We cut through the noise so you don't have to."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
            {FEATURES.map(({ icon, title, desc }) => (
              <FeatureCard key={title} icon={icon} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ RACQUET CTA STRIP ═════════════════════════════════════════════════
          Anchor section for users who don't know their racquet yet.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-court-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Not sure which racquet you have?</h2>
          <p className="text-green-200 mb-7 max-w-md mx-auto">
            Browse our racquet guide to find your frame and see which strings we recommend.
          </p>
          <Link
            href="/racquets"
            className="inline-flex items-center gap-2 bg-ball text-court font-bold px-7 py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
          >
            Browse racquets →
          </Link>
        </div>
      </section>
    </>
  );
}

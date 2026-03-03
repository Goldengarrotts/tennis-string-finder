import type { Metadata } from 'next';
import Link from 'next/link';
import { strings } from '@/data/strings';
import StringCard from '@/components/StringCard';

export const metadata: Metadata = {
  title: 'StringLab — Tennis String Finder & Comparison',
  description:
    'Not sure what tennis string to use? Answer 4 quick questions about your racquet and playing goals, and get personalised string recommendations with clear explanations.',
};

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

const POPULAR_SLUGS = ['luxilon-alu-power', 'babolat-rpm-blast', 'wilson-nxt', 'tecnifibre-x-one-biphase'];

export default function HomePage() {
  const popular = POPULAR_SLUGS.map((slug) => strings.find((s) => s.slug === slug)).filter(Boolean);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-court text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="text-ball font-semibold text-sm uppercase tracking-widest mb-4">
            The tennis string guide
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Find the string{' '}
            <br className="hidden sm:block" />
            <span className="text-ball">your game deserves.</span>
          </h1>
          <p className="text-green-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Answer 4 quick questions about your racquet and playing goals. Get personalised string
            recommendations with clear, jargon-free explanations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/finder"
              className="bg-ball text-court font-bold px-8 py-4 rounded-xl text-lg hover:brightness-110 transition-all shadow-lg"
            >
              Find my string →
            </Link>
            <Link
              href="/strings"
              className="bg-white/10 text-white border border-white/20 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-colors"
            >
              Browse all strings
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🎾', label: 'Pick your racquet' },
              { step: '2', icon: '🎯', label: 'Choose your goals' },
              { step: '3', icon: '⚙️', label: 'Set your preferences' },
              { step: '4', icon: '🏆', label: 'Get your top 3 picks' },
            ].map(({ step, icon, label }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-court/10 rounded-full flex items-center justify-center text-court font-bold text-lg mx-auto mb-3">
                  {step}
                </div>
                <p className="text-3xl mb-2">{icon}</p>
                <p className="font-semibold text-gray-800">{label}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/finder" className="btn-primary inline-block">
              Start the finder
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Why StringLab?</h2>
        <p className="text-gray-500 mb-10">We cut through the noise so you don&apos;t have to.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-3xl mb-3">{icon}</p>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular strings ── */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Popular strings</h2>
              <p className="text-gray-500 mt-1">The most-played strings on tour and at clubs worldwide.</p>
            </div>
            <Link href="/strings" className="text-court font-semibold text-sm hover:underline hidden sm:block">
              Browse all 20 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popular.map((s) => s && <StringCard key={s.slug} string={s} compareLink />)}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link href="/strings" className="btn-ghost">Browse all strings →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="bg-court-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-3">Not sure which racquet you have?</h2>
          <p className="text-green-200 mb-6">
            Browse our racquet guide to find your frame and see which strings we recommend.
          </p>
          <Link
            href="/racquets"
            className="bg-ball text-court font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all inline-block"
          >
            Browse racquets →
          </Link>
        </div>
      </section>
    </>
  );
}

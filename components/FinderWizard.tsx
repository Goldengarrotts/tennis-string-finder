'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { racquets } from '@/data/racquets';
import { recommend } from '@/lib/recommend';
import type { Goal, FinderParams, Recommendation } from '@/types';
import RatingBar from './RatingBar';

type Step = 1 | 2 | 3 | 4 | 5;

const GOALS: { key: Goal; label: string; icon: string; description: string }[] = [
  { key: 'comfort', label: 'Comfort', icon: '☁️', description: 'Soft feel, arm-friendly, plush response' },
  { key: 'spin', label: 'Spin', icon: '🌀', description: 'Heavy topspin, bite on the ball, kick serve' },
  { key: 'control', label: 'Control', icon: '🎯', description: 'Precision placement, consistent depth' },
  { key: 'power', label: 'Power', icon: '⚡', description: 'Extra pace, lively response, big hitting' },
  { key: 'durability', label: 'Durability', icon: '🔩', description: 'Lasts longer, good for string breakers' },
];

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

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step < current
                ? 'bg-court text-white'
                : step === current
                ? 'bg-ball text-court ring-2 ring-ball/30'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step < current ? '✓' : step}
          </div>
          {step < total && (
            <div className={`h-0.5 w-6 ${step < current ? 'bg-court' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function FinderWizard() {
  const [step, setStep] = useState<Step>(1);
  const [racquetQuery, setRacquetQuery] = useState('');
  const [selectedRacquet, setSelectedRacquet] = useState<string>('');
  const [primaryGoal, setPrimaryGoal] = useState<Goal | null>(null);
  const [secondaryGoal, setSecondaryGoal] = useState<Goal | null>(null);
  const [armSensitive, setArmSensitive] = useState(false);
  const [hybrid, setHybrid] = useState(false);
  const [results, setResults] = useState<Recommendation[]>([]);

  const filteredRacquets = useMemo(
    () =>
      racquetQuery.length >= 1
        ? racquets.filter(
            (r) =>
              r.name.toLowerCase().includes(racquetQuery.toLowerCase()) ||
              r.brand.toLowerCase().includes(racquetQuery.toLowerCase())
          )
        : racquets,
    [racquetQuery]
  );

  const selectedRacquetObj = racquets.find((r) => r.slug === selectedRacquet);

  function handleRun() {
    if (!selectedRacquet || !primaryGoal || !secondaryGoal) return;
    const params: FinderParams = {
      racquetSlug: selectedRacquet,
      primaryGoal,
      secondaryGoal,
      armSensitive,
      hybrid,
    };
    setResults(recommend(params));
    setStep(5);
  }

  function reset() {
    setStep(1);
    setRacquetQuery('');
    setSelectedRacquet('');
    setPrimaryGoal(null);
    setSecondaryGoal(null);
    setArmSensitive(false);
    setHybrid(false);
    setResults([]);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {step < 5 && <StepIndicator current={step} total={4} />}

      {/* ── Step 1: Racquet ── */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">What racquet do you use?</h2>
          <p className="text-gray-500 mb-6">Search by brand or model — we'll find the right tension range for you.</p>

          <input
            type="text"
            value={racquetQuery}
            onChange={(e) => {
              setRacquetQuery(e.target.value);
              setSelectedRacquet('');
            }}
            placeholder="e.g. Wilson, Pure Aero, Blade 98…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-court mb-3"
          />

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredRacquets.map((r) => (
              <button
                key={r.slug}
                onClick={() => {
                  setSelectedRacquet(r.slug);
                  setRacquetQuery(`${r.brand} ${r.name}`);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  selectedRacquet === r.slug
                    ? 'border-court bg-court/5 text-court'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">{r.brand}</span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <span className="block">{r.stringPattern}</span>
                    <span>{r.tensionMin}–{r.tensionMax} lb</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              disabled={!selectedRacquet}
              onClick={() => setStep(2)}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Your goals →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Primary goal ── */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">What's your #1 priority?</h2>
          <p className="text-gray-500 mb-6">Pick the single most important thing you want from your strings.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map(({ key, label, icon, description }) => (
              <button
                key={key}
                onClick={() => {
                  setPrimaryGoal(key);
                  if (secondaryGoal === key) setSecondaryGoal(null);
                }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  primaryGoal === key
                    ? 'border-court bg-court/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{icon}</span>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="btn-ghost">← Back</button>
            <button
              disabled={!primaryGoal}
              onClick={() => setStep(3)}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Secondary goal →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Secondary goal ── */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Secondary priority?</h2>
          <p className="text-gray-500 mb-6">
            After {primaryGoal}, what else matters most to you?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.filter((g) => g.key !== primaryGoal).map(({ key, label, icon, description }) => (
              <button
                key={key}
                onClick={() => setSecondaryGoal(key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  secondaryGoal === key
                    ? 'border-court bg-court/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{icon}</span>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(2)} className="btn-ghost">← Back</button>
            <button
              disabled={!secondaryGoal}
              onClick={() => setStep(4)}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Final options →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Arm + Hybrid ── */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">A couple more things…</h2>
          <p className="text-gray-500 mb-6">These help us avoid recommending strings that might hurt you or don't suit your setup.</p>

          {/* Arm sensitivity */}
          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all mb-4 ${
              armSensitive ? 'border-court bg-court/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setArmSensitive(!armSensitive)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>💪</span> Arm sensitivity
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Do you have (or want to avoid) tennis elbow, wrist, or shoulder pain? We'll deprioritise hard polys.
                </p>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-colors shrink-0 ml-4 ${
                  armSensitive ? 'bg-court' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-1 mx-1 ${
                    armSensitive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Hybrid */}
          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
              hybrid ? 'border-court bg-court/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setHybrid(!hybrid)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🔀</span> Open to a hybrid setup?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Hybrids combine two strings (e.g. poly mains + natural gut crosses) for the best of both worlds. More expensive but often preferred by advanced players.
                </p>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-colors shrink-0 ml-4 ${
                  hybrid ? 'bg-court' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-1 mx-1 ${
                    hybrid ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(3)} className="btn-ghost">← Back</button>
            <button onClick={handleRun} className="btn-primary">
              Show my recommendations →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Results ── */}
      {step === 5 && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Your top string picks</h2>
            <p className="text-gray-500">
              Based on your {selectedRacquetObj?.brand} {selectedRacquetObj?.name},{' '}
              with <strong>{primaryGoal}</strong> as your main priority.
            </p>
          </div>

          <div className="space-y-5">
            {results.map((rec, i) => (
              <ResultCard key={rec.string.slug} rec={rec} rank={i + 1} racquet={selectedRacquetObj} />
            ))}
          </div>

          {/* Compare link */}
          {results.length >= 2 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-3">Want to compare these side by side?</p>
              <Link
                href={`/compare?strings=${results.map((r) => r.string.slug).join(',')}`}
                className="btn-primary inline-block"
              >
                Compare all 3 →
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={reset} className="btn-ghost">Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  rec,
  rank,
  racquet,
}: {
  rec: Recommendation;
  rank: number;
  racquet: ReturnType<typeof racquets.find>;
}) {
  const s = rec.string;
  const rankColors = ['bg-ball text-court', 'bg-gray-200 text-gray-700', 'bg-gray-100 text-gray-600'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Rank bar */}
      <div className={`px-5 py-2 flex items-center gap-3 ${rank === 1 ? 'bg-ball/20' : 'bg-gray-50'}`}>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${rankColors[rank - 1]}`}>
          {rank}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          {rank === 1 ? '🏆 Best match' : rank === 2 ? 'Strong alternative' : 'Also consider'}
        </span>
      </div>

      <div className="p-5">
        {/* String info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{s.brand}</p>
            <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {TYPE_LABELS[s.type]} · {PRICE_LABELS[s.priceBand]}
            </p>
          </div>
          {s.armFriendly && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full shrink-0">
              Arm-friendly
            </span>
          )}
        </div>

        {/* Ratings */}
        <div className="space-y-1.5 mb-4">
          <RatingBar label="Spin" value={s.ratings.spin} />
          <RatingBar label="Power" value={s.ratings.power} />
          <RatingBar label="Control" value={s.ratings.control} />
          <RatingBar label="Comfort" value={s.ratings.comfort} />
          <RatingBar label="Durability" value={s.ratings.durability} />
        </div>

        {/* Why this pick */}
        <div className="bg-court/5 border border-court/20 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-court uppercase tracking-wide mb-2">Why this pick</p>
          <ul className="space-y-1.5">
            {rec.reasons.map((r, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-court mt-0.5">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tension guidance */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Suggested tension</p>
          <p className="text-lg font-bold text-gray-900">
            {rec.suggestedTensionMin}–{rec.suggestedTensionMax} lb
          </p>
          <p className="text-xs text-gray-500">
            {s.type === 'polyester'
              ? 'Polys are usually strung lower than mains label — they play stiffer than they feel.'
              : "Based on your racquet's recommended range."}
          </p>
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link
            href={`/strings/${s.slug}`}
            className="flex-1 text-center text-sm font-medium py-2.5 rounded-lg bg-court text-white hover:bg-court-dark transition-colors"
          >
            Full string profile
          </Link>
          <Link
            href={`/compare?strings=${s.slug}`}
            className="text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-200 text-gray-600 hover:border-court hover:text-court transition-colors"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}

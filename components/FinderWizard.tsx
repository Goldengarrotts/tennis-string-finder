'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { racquets } from '@/data/racquets';
import { recommend, isDensePattern } from '@/lib/recommend';
import type { Goal, FinderParams, PlayFrequency, Recommendation } from '@/types';
import WizardSummaryPanel, { type SummaryData } from './WizardSummaryPanel';
import SelectableCardOption from './SelectableCardOption';
import WizardResultCard from './WizardResultCard';
import type { Region } from '@/data/retailLinks';

// ─── Step type (1–5 = form steps, 6 = results) ───────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Static option lists ──────────────────────────────────────────────────────

const GOALS: { key: Goal; label: string; icon: string; description: string }[] = [
  { key: 'comfort', label: 'Comfort', icon: '☁️', description: 'Soft feel, arm-friendly, plush response' },
  { key: 'spin', label: 'Spin', icon: '🌀', description: 'Heavy topspin, bite on the ball, kick serve' },
  { key: 'control', label: 'Control', icon: '🎯', description: 'Precision placement, consistent depth' },
  { key: 'power', label: 'Power', icon: '⚡', description: 'Extra pace, lively response, big hitting' },
  { key: 'durability', label: 'Durability', icon: '🔩', description: 'Lasts longer, good for string breakers' },
];

const PLAY_FREQ_OPTIONS: { key: PlayFrequency; icon: string; title: string; description: string }[] = [
  {
    key: 'occasional',
    icon: '☀️',
    title: 'Occasionally',
    description: 'Less than once a week — leisure or social tennis',
  },
  {
    key: 'weekly',
    icon: '📅',
    title: 'Weekly',
    description: 'About once a week — regular but not intensive',
  },
  {
    key: '2to3',
    icon: '🎾',
    title: '2–3× per week',
    description: 'Club player or regular training sessions',
  },
  {
    key: 'competitive',
    icon: '🏆',
    title: 'Competitive',
    description: 'Most days — tournament play or intensive training',
  },
];

const FREQ_LABELS: Record<PlayFrequency, string> = {
  occasional: 'occasionally',
  weekly: 'weekly',
  '2to3': '2–3× per week',
  competitive: 'competitively',
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8" role="list" aria-label="Wizard progress">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2" role="listitem">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step < current
                ? 'bg-court text-white'
                : step === current
                ? 'bg-ball text-court ring-2 ring-ball/30'
                : 'bg-gray-100 text-gray-400'
            }`}
            aria-current={step === current ? 'step' : undefined}
          >
            {step < current ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < total && (
            <div className={`h-0.5 w-6 transition-colors ${step < current ? 'bg-court' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Toggle card (arm / hybrid / gut exclusion) ───────────────────────────────

function ToggleCard({
  icon,
  title,
  body,
  active,
  onToggle,
  activeNote,
}: {
  icon: string;
  title: string;
  body: string;
  active: boolean;
  onToggle: () => void;
  activeNote?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      aria-pressed={active}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-court focus-visible:ring-offset-2 ${
        active ? 'border-court bg-court/5' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <span aria-hidden="true">{icon}</span> {title}
          </p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{body}</p>
          {active && activeNote && (
            <p className="text-xs text-court mt-2 font-medium">✓ {activeNote}</p>
          )}
        </div>
        {/* Toggle pill */}
        <div
          className={`w-12 h-7 rounded-full transition-colors shrink-0 ${active ? 'bg-court' : 'bg-gray-200'}`}
          aria-hidden="true"
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-1 mx-1 ${
              active ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────

function ScoringShimmer() {
  return (
    <div>
      <p className="text-center text-gray-400 text-sm mb-6 animate-pulse">
        Scoring your matches…
      </p>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="h-11 bg-gray-100 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
              <div className="space-y-2 pt-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex gap-3 items-center">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-16 shrink-0" />
                    <div className="h-2.5 bg-gray-100 rounded-full animate-pulse flex-1" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-6 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Why these results? expandable ───────────────────────────────────────────

function WhyResultsSection({
  racquetName,
  racquetPattern,
  primaryGoal,
  secondaryGoal,
  playFrequency,
  armSensitive,
  hybrid,
  excludeNaturalGut,
}: {
  racquetName: string;
  racquetPattern: string;
  primaryGoal: Goal;
  secondaryGoal: Goal;
  playFrequency: PlayFrequency;
  armSensitive: boolean;
  hybrid: boolean;
  excludeNaturalGut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dense = isDensePattern(racquetPattern);

  const durabilityExplain: Record<PlayFrequency, string> = {
    occasional: 'not factored in (occasional players restring less often)',
    weekly: 'lightly weighted',
    '2to3': 'moderately weighted',
    competitive: 'heavily weighted — daily play demands longevity',
  };

  const factors = [
    `Racquet: ${racquetName} (${racquetPattern}${dense ? ' — dense bed, spin-generating strings favoured' : ''})`,
    `Primary goal: ${primaryGoal} — contributes 60% of the score`,
    `Secondary goal: ${secondaryGoal} — contributes 25% of the score`,
    armSensitive
      ? 'Arm sensitivity on — stiff polys were penalised; arm-friendly strings got a boost'
      : null,
    hybrid
      ? 'Hybrid setup open — natural gut and multifilament got a boost as hybrid candidates'
      : 'Hybrid setup off — natural gut was deprioritised (it shines most in hybrid configurations)',
    `Play frequency: you play ${FREQ_LABELS[playFrequency]} — durability was ${durabilityExplain[playFrequency]}`,
    excludeNaturalGut ? 'Natural gut strings were excluded from recommendations' : null,
    'Diversity: no more than 2 strings of the same type appear in the results',
  ].filter(Boolean) as string[];

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        aria-expanded={open}
        aria-controls="why-results-panel"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why these results?
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div id="why-results-panel" className="px-5 pb-5 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium pt-4 pb-2">
            Key factors in your recommendations:
          </p>
          <ul className="space-y-2">
            {factors.map((f, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                <span className="text-court shrink-0 mt-0.5" aria-hidden="true">·</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main wizard component ────────────────────────────────────────────────────

export default function FinderWizard({ defaultRegion }: { defaultRegion?: Region }) {
  // Wizard state
  const [step, setStep] = useState<Step>(1);
  const [racquetQuery, setRacquetQuery] = useState('');
  const [selectedRacquet, setSelectedRacquet] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<Goal | null>(null);
  const [secondaryGoal, setSecondaryGoal] = useState<Goal | null>(null);
  const [playFrequency, setPlayFrequency] = useState<PlayFrequency | null>(null);
  const [armSensitive, setArmSensitive] = useState(false);
  const [hybrid, setHybrid] = useState(false);
  const [excludeNaturalGut, setExcludeNaturalGut] = useState(false);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [scoring, setScoring] = useState(false);

  // Derived
  const selectedRacquetObj = racquets.find((r) => r.slug === selectedRacquet);

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

  // Live summary data for sidebar/accordion
  const summaryData: SummaryData = {
    racquet: selectedRacquetObj
      ? `${selectedRacquetObj.brand} ${selectedRacquetObj.name}`
      : null,
    primaryGoal,
    secondaryGoal,
    playFrequency,
    armSensitive,
    hybrid,
    excludeNaturalGut,
  };

  // Handlers
  function handleRun() {
    if (!selectedRacquet || !primaryGoal || !secondaryGoal || !playFrequency) return;
    const params: FinderParams = {
      racquetSlug: selectedRacquet,
      primaryGoal,
      secondaryGoal,
      armSensitive,
      hybrid,
      playFrequency,
      excludeNaturalGut,
    };
    const recs = recommend(params);
    setResults(recs);
    setScoring(true);
    setStep(6);
    // 700 ms shimmer — just long enough to feel responsive, not annoying
    setTimeout(() => setScoring(false), 700);
  }

  function reset() {
    setStep(1);
    setRacquetQuery('');
    setSelectedRacquet('');
    setPrimaryGoal(null);
    setSecondaryGoal(null);
    setPlayFrequency(null);
    setArmSensitive(false);
    setHybrid(false);
    setExcludeNaturalGut(false);
    setResults([]);
    setScoring(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* ── Steps 1–5: two-column layout on lg+  ── */}
      {step < 6 && (
        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* Main wizard column */}
          <div className="flex-1 min-w-0">
            {/* Mobile summary accordion — collapsed by default */}
            <WizardSummaryPanel data={summaryData} variant="mobile" />

            {/* Step progress indicator */}
            <StepIndicator current={step} total={5} />

            {/* ─ Step 1: Racquet ─ */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">What racquet do you use?</h2>
                <p className="text-gray-500 mb-6">
                  Search by brand or model — we'll factor in string pattern and tension range.
                </p>

                <input
                  type="text"
                  value={racquetQuery}
                  onChange={(e) => {
                    setRacquetQuery(e.target.value);
                    setSelectedRacquet('');
                  }}
                  placeholder="e.g. Wilson, Pure Aero, Blade 98…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-court mb-3"
                  aria-label="Search racquets"
                />

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1" role="listbox" aria-label="Racquet options">
                  {filteredRacquets.map((r) => (
                    <button
                      key={r.slug}
                      role="option"
                      aria-selected={selectedRacquet === r.slug}
                      onClick={() => {
                        setSelectedRacquet(r.slug);
                        setRacquetQuery(`${r.brand} ${r.name}`);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court ${
                        selectedRacquet === r.slug
                          ? 'border-court bg-court/5 shadow-sm'
                          : 'border-gray-200 hover:border-court/40 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-gray-400 block">{r.brand}</span>
                          <span
                            className={`font-medium ${
                              selectedRacquet === r.slug ? 'text-court' : 'text-gray-800'
                            }`}
                          >
                            {r.name}
                          </span>
                        </div>
                        <div className="text-right text-xs text-gray-400 shrink-0">
                          <span className="block">{r.stringPattern}</span>
                          <span>{r.tensionMin}–{r.tensionMax} lb</span>
                        </div>
                        {selectedRacquet === r.slug && (
                          <span className="shrink-0 w-5 h-5 bg-court rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
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

            {/* ─ Step 2: Primary goal ─ */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">What's your #1 priority?</h2>
                <p className="text-gray-500 mb-6">
                  Pick the single most important thing you want from your strings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map(({ key, label, icon, description }) => (
                    <SelectableCardOption
                      key={key}
                      selected={primaryGoal === key}
                      onClick={() => {
                        setPrimaryGoal(key);
                        if (secondaryGoal === key) setSecondaryGoal(null);
                      }}
                      icon={icon}
                      title={label}
                      description={description}
                    />
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

            {/* ─ Step 3: Secondary goal ─ */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Secondary priority?</h2>
                <p className="text-gray-500 mb-6">
                  After <strong>{primaryGoal}</strong>, what else matters most to you?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.filter((g) => g.key !== primaryGoal).map(({ key, label, icon, description }) => (
                    <SelectableCardOption
                      key={key}
                      selected={secondaryGoal === key}
                      onClick={() => setSecondaryGoal(key)}
                      icon={icon}
                      title={label}
                      description={description}
                    />
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-ghost">← Back</button>
                  <button
                    disabled={!secondaryGoal}
                    onClick={() => setStep(4)}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next: Play frequency →
                  </button>
                </div>
              </div>
            )}

            {/* ─ Step 4: Play frequency (NEW) ─ */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">How often do you play?</h2>
                <p className="text-gray-500 mb-6">
                  Play frequency helps us weight durability in your recommendations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLAY_FREQ_OPTIONS.map(({ key, icon, title, description }) => (
                    <SelectableCardOption
                      key={key}
                      selected={playFrequency === key}
                      onClick={() => setPlayFrequency(key)}
                      icon={icon}
                      title={title}
                      description={description}
                    />
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(3)} className="btn-ghost">← Back</button>
                  <button
                    disabled={!playFrequency}
                    onClick={() => setStep(5)}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next: Final options →
                  </button>
                </div>
              </div>
            )}

            {/* ─ Step 5: Preferences (arm / hybrid / exclude gut) ─ */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">A couple more things…</h2>
                <p className="text-gray-500 mb-6">
                  These help us fine-tune recommendations for your situation.
                </p>

                <div className="space-y-3">
                  <ToggleCard
                    icon="💪"
                    title="Arm sensitivity"
                    body="Do you have (or want to avoid) tennis elbow, wrist, or shoulder pain? We'll deprioritise hard polys."
                    active={armSensitive}
                    onToggle={() => setArmSensitive(!armSensitive)}
                  />

                  <ToggleCard
                    icon="🔀"
                    title="Open to a hybrid setup?"
                    body="Hybrids combine two strings (e.g. poly mains + natural gut crosses) for the best of both worlds. More expensive but often preferred by advanced players."
                    active={hybrid}
                    onToggle={() => setHybrid(!hybrid)}
                  />

                  <ToggleCard
                    icon="🌱"
                    title="Natural gut strings"
                    body="Natural gut strings are made from animal-derived material and are known for comfort and power. If you'd prefer not to see natural gut recommendations, you can exclude them."
                    active={excludeNaturalGut}
                    onToggle={() => setExcludeNaturalGut(!excludeNaturalGut)}
                    activeNote="Natural gut strings will be excluded from recommendations"
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(4)} className="btn-ghost">← Back</button>
                  <button onClick={handleRun} className="btn-primary">
                    Show my recommendations →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop sticky summary panel — right column on lg+ */}
          <WizardSummaryPanel data={summaryData} variant="desktop" />
        </div>
      )}

      {/* ── Step 6: Results ── */}
      {step === 6 && (
        <div className="max-w-2xl mx-auto">
          {scoring ? (
            <ScoringShimmer />
          ) : (
            <div>
              {/* Microcopy header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Top matches based on your racquet and playing style
                </h2>
                <p className="text-gray-500 text-sm">
                  We've balanced spin, control, comfort and durability based on your answers.
                </p>
              </div>

              {/* Context chip row */}
              <div className="flex flex-wrap gap-2 mb-7">
                {selectedRacquetObj && (
                  <span className="text-xs bg-court/10 text-court font-medium px-3 py-1.5 rounded-full">
                    🎾 {selectedRacquetObj.brand} {selectedRacquetObj.name}
                  </span>
                )}
                {primaryGoal && (
                  <span className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1.5 rounded-full capitalize">
                    🎯 {primaryGoal}
                  </span>
                )}
                {secondaryGoal && (
                  <span className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1.5 rounded-full capitalize">
                    + {secondaryGoal}
                  </span>
                )}
                {playFrequency && (
                  <span className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1.5 rounded-full">
                    📅 {PLAY_FREQ_OPTIONS.find((o) => o.key === playFrequency)?.title}
                  </span>
                )}
                {excludeNaturalGut && (
                  <span className="text-xs bg-amber-50 text-amber-700 font-medium px-3 py-1.5 rounded-full">
                    🌱 No natural gut
                  </span>
                )}
              </div>

              {/* Result cards */}
              <div className="space-y-5">
                {results.map((rec, i) => (
                  <WizardResultCard
                    key={rec.string.slug}
                    rec={rec}
                    rank={i + 1}
                    racquet={selectedRacquetObj}
                    defaultRegion={defaultRegion}
                  />
                ))}
              </div>

              {/* Why these results */}
              {selectedRacquetObj && primaryGoal && secondaryGoal && playFrequency && (
                <WhyResultsSection
                  racquetName={`${selectedRacquetObj.brand} ${selectedRacquetObj.name}`}
                  racquetPattern={selectedRacquetObj.stringPattern}
                  primaryGoal={primaryGoal}
                  secondaryGoal={secondaryGoal}
                  playFrequency={playFrequency}
                  armSensitive={armSensitive}
                  hybrid={hybrid}
                  excludeNaturalGut={excludeNaturalGut}
                />
              )}

              {/* Compare link */}
              {results.length >= 2 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-3">Want to compare these side by side?</p>
                  <Link
                    href={`/compare?strings=${results
                      .slice(0, 3)
                      .map((r) => r.string.slug)
                      .join(',')}`}
                    className="btn-primary inline-block"
                  >
                    Compare top 3 →
                  </Link>
                </div>
              )}

              <div className="mt-6 text-center">
                <button onClick={reset} className="btn-ghost">
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

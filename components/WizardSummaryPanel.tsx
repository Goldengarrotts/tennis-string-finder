'use client';

import { useState } from 'react';
import type { Goal, PlayFrequency } from '@/types';

export interface SummaryData {
  racquet: string | null;
  primaryGoal: Goal | null;
  secondaryGoal: Goal | null;
  playFrequency: PlayFrequency | null;
  armSensitive: boolean;
  hybrid: boolean;
  excludeNaturalGut: boolean;
}

const GOAL_LABELS: Record<Goal, string> = {
  comfort: 'Comfort',
  spin: 'Spin',
  control: 'Control',
  power: 'Power',
  durability: 'Durability',
};

const FREQ_LABELS: Record<PlayFrequency, string> = {
  occasional: 'Occasionally',
  weekly: 'Weekly',
  '2to3': '2–3× per week',
  competitive: 'Competitive',
};

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 shrink-0 pt-px">{label}</span>
      <span className="text-xs font-medium text-gray-800 text-right leading-relaxed">{value}</span>
    </div>
  );
}

function PanelContent({ data }: { data: SummaryData }) {
  if (!data.racquet && !data.primaryGoal) {
    return (
      <p className="text-xs text-gray-400 italic">
        Your selections will appear here as you progress.
      </p>
    );
  }

  const preferences = [
    data.armSensitive ? 'Arm-sensitive' : null,
    data.hybrid ? 'Open to hybrids' : null,
    data.excludeNaturalGut ? 'No natural gut' : null,
  ]
    .filter(Boolean)
    .join(' · ') || null;

  return (
    <div>
      <Row label="Racquet" value={data.racquet} />
      <Row
        label="Primary"
        value={data.primaryGoal ? GOAL_LABELS[data.primaryGoal] : null}
      />
      <Row
        label="Secondary"
        value={data.secondaryGoal ? GOAL_LABELS[data.secondaryGoal] : null}
      />
      <Row
        label="Frequency"
        value={data.playFrequency ? FREQ_LABELS[data.playFrequency] : null}
      />
      <Row label="Preferences" value={preferences} />
    </div>
  );
}

interface Props {
  data: SummaryData;
  /** 'mobile' → collapsible accordion (lg:hidden).
   *  'desktop' → sticky sidebar (hidden lg:block). */
  variant: 'mobile' | 'desktop';
}

/**
 * Live summary of wizard selections.
 * Render with variant="mobile" inside the step column (shows on small screens).
 * Render with variant="desktop" as a grid sibling (shows on lg+).
 */
export default function WizardSummaryPanel({ data, variant }: Props) {
  const [open, setOpen] = useState(false);

  if (variant === 'desktop') {
    return (
      <div className="hidden lg:block sticky top-24 w-64 xl:w-72 shrink-0 self-start">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-court uppercase tracking-widest mb-3">
            Your selections
          </p>
          <PanelContent data={data} />
        </div>
      </div>
    );
  }

  // Mobile collapsible accordion
  return (
    <div className="lg:hidden mb-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-controls="wizard-summary-accordion"
      >
        <span className="flex items-center gap-2">
          {/* Clipboard icon */}
          <svg
            className="w-4 h-4 text-court"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Your selections
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
        <div
          id="wizard-summary-accordion"
          className="mt-1 bg-white border border-gray-200 rounded-xl px-4"
        >
          <PanelContent data={data} />
        </div>
      )}
    </div>
  );
}

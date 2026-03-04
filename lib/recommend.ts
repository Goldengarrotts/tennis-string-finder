import { strings } from '@/data/strings';
import { racquets } from '@/data/racquets';
import type {
  FinderParams,
  Goal,
  PlayFrequency,
  Racquet,
  Recommendation,
  ResultLabel,
  TennisString,
} from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const GOAL_TO_RATING: Record<Goal, keyof TennisString['ratings']> = {
  comfort: 'comfort',
  spin: 'spin',
  control: 'control',
  power: 'power',
  durability: 'durability',
};

/**
 * How much each durability point contributes to the overall score.
 * Competitive players should see longer-lasting strings prioritised.
 */
const DURABILITY_WEIGHT: Record<PlayFrequency, number> = {
  occasional: 0.0,
  weekly: 0.03,
  '2to3': 0.07,
  competitive: 0.12,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isDensePattern(pattern: string): boolean {
  const crosses = parseInt(pattern.split('x')[1] ?? '0', 10);
  return crosses >= 20;
}

/**
 * Build 2–4 plain-English "why this fits" reasons for a given string.
 */
function buildReasons(
  s: TennisString,
  params: FinderParams,
  racquet: Racquet | undefined
): string[] {
  const reasons: string[] = [];
  const pr = s.ratings[GOAL_TO_RATING[params.primaryGoal]];
  const sr = s.ratings[GOAL_TO_RATING[params.secondaryGoal]];

  const goalLabels: Record<Goal, string> = {
    comfort: 'comfort',
    spin: 'spin potential',
    control: 'control',
    power: 'power',
    durability: 'durability',
  };

  // Primary goal match
  if (pr >= 8) {
    reasons.push(`Excellent ${goalLabels[params.primaryGoal]} (${pr}/10) — your #1 priority`);
  } else if (pr >= 6) {
    reasons.push(`Solid ${goalLabels[params.primaryGoal]} (${pr}/10) for your main priority`);
  }

  // Secondary goal match
  if (sr >= 8) {
    reasons.push(`Strong ${goalLabels[params.secondaryGoal]} (${sr}/10) — your secondary goal`);
  } else if (sr >= 6) {
    reasons.push(`Good ${goalLabels[params.secondaryGoal]} (${sr}/10) as a secondary benefit`);
  }

  // Arm sensitivity
  if (params.armSensitive && s.armFriendly) {
    reasons.push('Arm-friendly construction — safe for sensitive elbows and shoulders');
  }
  if (s.type === 'multifilament' && params.armSensitive) {
    reasons.push('Multifilament fibres absorb vibration better than stiff polys');
  }

  // Racquet pattern synergy
  if (racquet && isDensePattern(racquet.stringPattern) && s.ratings.spin >= 7) {
    reasons.push(
      `Works well with your ${racquet.stringPattern} pattern — maintains spin in a dense bed`
    );
  }

  // Price context
  if (s.priceBand === 'budget') {
    reasons.push('Budget-friendly — great performance without the premium price');
  } else if (s.priceBand === 'premium') {
    reasons.push('Premium quality that rewards serious players');
  }

  // Play frequency context
  if (params.playFrequency === 'competitive' && s.ratings.durability >= 8) {
    reasons.push(`High durability (${s.ratings.durability}/10) — holds up to daily match play`);
  } else if (params.playFrequency === '2to3' && s.ratings.durability >= 8) {
    reasons.push(`Good durability (${s.ratings.durability}/10) — suits frequent play`);
  } else if (params.playFrequency === 'occasional' && s.priceBand === 'budget') {
    reasons.push('Cost-effective for occasional players who restring infrequently');
  }

  // Hybrid context
  if (params.hybrid && (s.type === 'natural-gut' || s.type === 'multifilament')) {
    reasons.push('Works excellently as a cross in a hybrid setup for added comfort and feel');
  }

  return reasons.slice(0, 4);
}

/**
 * Compute recommended stringing tension for a given string and racquet.
 */
function computeTension(
  s: TennisString,
  racquet: Racquet | undefined,
  params: FinderParams
): { min: number; max: number } {
  const baseMin = racquet?.tensionMin ?? 50;
  const baseMax = racquet?.tensionMax ?? 60;

  // Polys play stiffer than they feel — string 10–15% lower
  if (s.type === 'polyester') {
    const adj = Math.round((baseMax - baseMin) * 0.15);
    return { min: baseMin - adj, max: baseMax - adj };
  }
  // Power seekers: lower tension = more trampoline
  if (params.primaryGoal === 'power') {
    return { min: baseMin, max: Math.round((baseMin + baseMax) / 2) };
  }
  // Control seekers: tighter strings = more precision
  if (params.primaryGoal === 'control') {
    return { min: Math.round((baseMin + baseMax) / 2), max: baseMax };
  }

  return { min: baseMin, max: baseMax };
}

/**
 * Assign human-readable role labels to each ranked result.
 * Rank 0 = Best overall, rank 1 = Great alternative,
 * then special roles for budget / arm-friendly / durability.
 */
function assignLabels(
  picks: Array<{ string: TennisString; score: number }>,
  params: FinderParams
): ResultLabel[] {
  const labels: ResultLabel[] = picks.map(() => 'Strong match');

  if (labels.length > 0) labels[0] = 'Best overall match';
  if (labels.length > 1) labels[1] = 'Great alternative';

  let budgetAssigned = false;
  let armAssigned = false;
  let durabilityAssigned = false;

  for (let i = 2; i < picks.length; i++) {
    const s = picks[i].string;

    if (!budgetAssigned && s.priceBand === 'budget') {
      labels[i] = 'Budget option';
      budgetAssigned = true;
      continue;
    }
    if (!armAssigned && params.armSensitive && s.armFriendly) {
      labels[i] = 'Arm-friendly pick';
      armAssigned = true;
      continue;
    }
    if (
      !durabilityAssigned &&
      (params.playFrequency === '2to3' || params.playFrequency === 'competitive') &&
      s.ratings.durability >= 8
    ) {
      labels[i] = 'Durability pick';
      durabilityAssigned = true;
      continue;
    }
  }

  return labels;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function recommend(params: FinderParams): Recommendation[] {
  const racquet = racquets.find((r) => r.slug === params.racquetSlug);
  const dense = racquet ? isDensePattern(racquet.stringPattern) : false;
  const durabilityWeight = DURABILITY_WEIGHT[params.playFrequency];

  // 1. Apply hard exclusion filter (natural gut if user opted out)
  const pool = strings.filter((s) => {
    if (params.excludeNaturalGut && s.type === 'natural-gut') return false;
    return true;
  });

  // 2. Score every string in the pool
  const scored = pool.map((s) => {
    // Base: primary goal 60%, secondary 25%, durability bonus by play frequency
    let score =
      s.ratings[GOAL_TO_RATING[params.primaryGoal]] * 0.6 +
      s.ratings[GOAL_TO_RATING[params.secondaryGoal]] * 0.25 +
      s.ratings.durability * durabilityWeight;

    // Arm sensitive: strongly penalise stiff, non-arm-friendly polys
    if (params.armSensitive && s.type === 'polyester' && !s.armFriendly) {
      score -= 4;
    }
    // Bonus for genuinely arm-friendly strings when sensitivity is flagged
    if (params.armSensitive && s.armFriendly) {
      score += 0.8;
    }

    // Hybrid toggle: natural gut and multi shine in hybrid setups
    if (params.hybrid) {
      if (s.type === 'natural-gut' || s.type === 'multifilament') score += 0.5;
      if (s.type === 'polyester') score += 0.3;
    } else {
      // Without hybrid: natural gut is expensive, low-durability in a full bed
      // and is best appreciated in hybrid configurations — deprioritise it
      if (s.type === 'natural-gut') score -= 2.0;
    }

    // Dense pattern: reward strings that generate their own spin
    if (dense && s.ratings.spin >= 7) {
      score += 0.3;
    }

    // Competitive players benefit from control and reliability
    if (params.playFrequency === 'competitive') {
      score += s.ratings.control * 0.05;
    }

    return { string: s, score };
  });

  // 3. Sort descending
  const allSorted = [...scored].sort((a, b) => b.score - a.score);

  // 4. Diversity rule: no more than 2 strings of the same type in the top 8
  const MAX_SAME_TYPE = 2;
  const TARGET = 8;
  const picked: typeof allSorted = [];
  const typeCounts: Partial<Record<string, number>> = {};

  for (const item of allSorted) {
    if (picked.length >= TARGET) break;
    const count = typeCounts[item.string.type] ?? 0;
    if (count >= MAX_SAME_TYPE) continue;
    picked.push(item);
    typeCounts[item.string.type] = count + 1;
  }

  // 5. If diversity filtering left fewer than TARGET, backfill from ranked remainder
  if (picked.length < TARGET) {
    for (const item of allSorted) {
      if (picked.length >= TARGET) break;
      if (!picked.includes(item)) picked.push(item);
    }
  }

  // 6. Assign role labels and build final recommendations
  const labels = assignLabels(picked, params);

  return picked.map(({ string, score }, i) => ({
    string,
    score,
    label: labels[i],
    reasons: buildReasons(string, params, racquet),
    suggestedTensionMin: computeTension(string, racquet, params).min,
    suggestedTensionMax: computeTension(string, racquet, params).max,
  }));
}

// ─── Hybrid helper (unchanged, updated to respect excludeNaturalGut) ─────────

export function getHybridRecommendation(
  mainSlug: string,
  params: FinderParams
): { cross: TennisString; reasons: string[] } | null {
  const mainString = strings.find((s) => s.slug === mainSlug);
  if (!mainString) return null;

  if (mainString.type === 'polyester') {
    const crosses = strings
      .filter(
        (s) =>
          (s.type === 'natural-gut' || s.type === 'multifilament') &&
          (!params.excludeNaturalGut || s.type !== 'natural-gut')
      )
      .sort((a, b) => b.ratings.comfort - a.ratings.comfort);
    const cross = crosses[0];
    if (!cross) return null;
    return {
      cross,
      reasons: [
        'Natural gut or multifilament cross softens the stiff poly main',
        "Adds comfort and feel while keeping the poly's control and durability",
        'The classic "Federer setup" — used by most poly-stringing pros',
      ],
    };
  }

  if (mainString.type === 'natural-gut' || mainString.type === 'multifilament') {
    const cross =
      strings.find((s) => s.slug === 'babolat-rpm-blast') ??
      strings.find((s) => s.type === 'polyester');
    if (!cross) return null;
    return {
      cross,
      reasons: [
        'Poly cross protects the soft main from breaking prematurely',
        'Adds control and spin bite without making the whole bed harsh',
        'Extends the life of expensive natural gut significantly',
      ],
    };
  }

  return null;
}

import { strings } from '@/data/strings';
import { racquets } from '@/data/racquets';
import type { FinderParams, Goal, Racquet, Recommendation, TennisString } from '@/types';

const GOAL_TO_RATING: Record<Goal, keyof TennisString['ratings']> = {
  comfort: 'comfort',
  spin: 'spin',
  control: 'control',
  power: 'power',
  durability: 'durability',
};

function isDensePattern(pattern: string): boolean {
  const crosses = parseInt(pattern.split('x')[1] ?? '0', 10);
  return crosses >= 20;
}

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

  if (pr >= 8) {
    reasons.push(`Excellent ${goalLabels[params.primaryGoal]} rating (${pr}/10) — your primary goal`);
  } else if (pr >= 6) {
    reasons.push(`Solid ${goalLabels[params.primaryGoal]} (${pr}/10) for your main priority`);
  }

  if (sr >= 8) {
    reasons.push(`Strong ${goalLabels[params.secondaryGoal]} (${sr}/10) — your secondary goal`);
  } else if (sr >= 6) {
    reasons.push(`Decent ${goalLabels[params.secondaryGoal]} (${sr}/10) as a secondary benefit`);
  }

  if (params.armSensitive && s.armFriendly) {
    reasons.push('Arm-friendly construction — safe for sensitive elbows and shoulders');
  }

  if (s.type === 'natural-gut') {
    reasons.push('Natural gut offers unmatched comfort and tension maintenance');
  }

  if (s.type === 'multifilament' && params.armSensitive) {
    reasons.push('Multifilament fibres absorb vibration better than stiff polys');
  }

  if (racquet && isDensePattern(racquet.stringPattern) && s.ratings.spin >= 7) {
    reasons.push(`Works well with your ${racquet.stringPattern} pattern — maintains spin in a dense bed`);
  }

  if (s.priceBand === 'budget') {
    reasons.push('Budget-friendly — great performance without the premium price');
  } else if (s.priceBand === 'premium') {
    reasons.push('Premium quality that justifies the price for serious players');
  }

  if (s.ratings.durability >= 8 && params.primaryGoal !== 'durability') {
    reasons.push(`Excellent durability (${s.ratings.durability}/10) — will last longer between restrings`);
  }

  return reasons.slice(0, 4);
}

function computeTension(
  s: TennisString,
  racquet: Racquet | undefined,
  params: FinderParams
): { min: number; max: number } {
  const baseMin = racquet?.tensionMin ?? 50;
  const baseMax = racquet?.tensionMax ?? 60;

  // Polys are usually strung 10% lower than recommended
  if (s.type === 'polyester') {
    const adj = Math.round((baseMax - baseMin) * 0.15);
    return { min: baseMin - adj, max: baseMax - adj };
  }

  // Power seekers: lower end
  if (params.primaryGoal === 'power') {
    return { min: baseMin, max: Math.round((baseMin + baseMax) / 2) };
  }

  // Control seekers: higher end
  if (params.primaryGoal === 'control') {
    return { min: Math.round((baseMin + baseMax) / 2), max: baseMax };
  }

  return { min: baseMin, max: baseMax };
}

export function recommend(params: FinderParams): Recommendation[] {
  const racquet = racquets.find((r) => r.slug === params.racquetSlug);
  const dense = racquet ? isDensePattern(racquet.stringPattern) : false;

  const scored = strings.map((s) => {
    let score =
      s.ratings[GOAL_TO_RATING[params.primaryGoal]] * 0.7 +
      s.ratings[GOAL_TO_RATING[params.secondaryGoal]] * 0.3;

    // Arm sensitive: penalise stiff polys
    if (params.armSensitive && s.type === 'polyester' && !s.armFriendly) {
      score -= 3;
    }

    // Hybrid preference: slight boost to strings commonly used in hybrids
    if (params.hybrid) {
      if (s.type === 'natural-gut' || s.type === 'multifilament') score += 0.5;
      if (s.type === 'polyester') score += 0.3;
    }

    // Dense pattern: boost strings that generate their own spin
    if (dense) {
      score += (s.ratings.spin - 5) * 0.1;
    }

    // Small bonus for arm-friendly strings when arm sensitive
    if (params.armSensitive && s.armFriendly) {
      score += 0.5;
    }

    return { string: s, score };
  });

  const top3 = scored.sort((a, b) => b.score - a.score).slice(0, 3);

  return top3.map(({ string, score }) => ({
    string,
    score,
    reasons: buildReasons(string, params, racquet),
    suggestedTensionMin: computeTension(string, racquet, params).min,
    suggestedTensionMax: computeTension(string, racquet, params).max,
  }));
}

export function getHybridRecommendation(
  mainSlug: string,
  params: FinderParams
): { cross: TennisString; reasons: string[] } | null {
  const mainString = strings.find((s) => s.slug === mainSlug);
  if (!mainString) return null;

  // If main is poly, suggest gut or multi as cross
  if (mainString.type === 'polyester') {
    const crosses = strings
      .filter((s) => s.type === 'natural-gut' || s.type === 'multifilament')
      .sort((a, b) => b.ratings.comfort - a.ratings.comfort);
    const cross = crosses[0];
    if (!cross) return null;
    return {
      cross,
      reasons: [
        'Natural gut or multifilament cross softens the stiff poly main',
        'Adds comfort and feel while keeping the poly\'s control and durability',
        'The classic "Federer setup" — used by most poly-stringing pros',
      ],
    };
  }

  // If main is gut/multi, suggest a poly cross for durability
  if (mainString.type === 'natural-gut' || mainString.type === 'multifilament') {
    const cross = strings.find((s) => s.slug === 'babolat-rpm-blast') ?? strings.find((s) => s.type === 'polyester');
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

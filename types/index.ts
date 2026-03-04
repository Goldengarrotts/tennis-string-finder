export type StringType = 'polyester' | 'multifilament' | 'natural-gut' | 'synthetic-gut';
export type StringFeel = 'crisp' | 'soft' | 'firm' | 'lively';
export type StringShape = 'round' | 'pentagonal' | 'hexagonal' | 'octagonal' | 'textured';
export type PriceBand = 'budget' | 'mid' | 'premium';
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type Balance = 'HH' | 'HL' | 'Even';
export type Goal = 'comfort' | 'spin' | 'control' | 'power' | 'durability';

/** How often the player plays — used to weight durability in recommendations. */
export type PlayFrequency = 'occasional' | 'weekly' | '2to3' | 'competitive';

/** Human-readable label assigned to each recommendation result slot. */
export type ResultLabel =
  | 'Best overall match'
  | 'Great alternative'
  | 'Budget option'
  | 'Arm-friendly pick'
  | 'Durability pick'
  | 'Strong match';

export interface Ratings {
  spin: number;
  power: number;
  control: number;
  comfort: number;
  durability: number;
}

export interface TennisString {
  id: string;
  slug: string;
  name: string;
  brand: string;
  type: StringType;
  feel: StringFeel;
  shape: StringShape;
  gauges: string[];
  armFriendly: boolean;
  priceBand: PriceBand;
  ratings: Ratings;
  description: string;
  whyPick: string[];
  affiliateLink?: string;
}

export interface Racquet {
  id: string;
  slug: string;
  name: string;
  brand: string;
  headSize: number;
  weight: number;
  balance: Balance;
  stringPattern: string;
  tensionMin: number;
  tensionMax: number;
  stiffnessRA?: number;
  level: Level;
  description: string;
  recommendedStrings?: string[];
  affiliateLink?: string;
}

export interface FinderParams {
  racquetSlug: string;
  primaryGoal: Goal;
  secondaryGoal: Goal;
  armSensitive: boolean;
  hybrid: boolean;
  /** Added step 4: adjusts durability weighting. */
  playFrequency: PlayFrequency;
  /** Added step 5: filters out natural-gut type entirely when true. */
  excludeNaturalGut: boolean;
}

export interface Recommendation {
  string: TennisString;
  score: number;
  /** Role label assigned to this result slot. */
  label: ResultLabel;
  reasons: string[];
  suggestedTensionMin: number;
  suggestedTensionMax: number;
}

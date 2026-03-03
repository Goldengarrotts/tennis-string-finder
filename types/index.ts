export type StringType = 'polyester' | 'multifilament' | 'natural-gut' | 'synthetic-gut';
export type StringFeel = 'crisp' | 'soft' | 'firm' | 'lively';
export type StringShape = 'round' | 'pentagonal' | 'hexagonal' | 'octagonal' | 'textured';
export type PriceBand = 'budget' | 'mid' | 'premium';
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type Balance = 'HH' | 'HL' | 'Even';
export type Goal = 'comfort' | 'spin' | 'control' | 'power' | 'durability';

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
}

export interface Recommendation {
  string: TennisString;
  score: number;
  reasons: string[];
  suggestedTensionMin: number;
  suggestedTensionMax: number;
}

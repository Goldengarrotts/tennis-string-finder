/**
 * Price Comparison types
 *
 * Data lives in data/price-comparison/*.json (committed, no external DB).
 * Phase 2: PCMerchant.provider + provider_config will be used to automate
 *           price fetching via Amazon PA-API, affiliate network feeds, or scraping.
 */

export type PCRegion = 'US' | 'UK' | 'EU';
export type PCCurrency = 'USD' | 'GBP' | 'EUR';
export type PCProvider = 'manual' | 'api' | 'scrape';

/**
 * A purchasable product variant — e.g. "Solinco Hyper-G 1.25mm 12m set"
 * or "Solinco Hyper-G 1.25mm 200m reel".
 */
export interface PCProduct {
  /** Unique ID, e.g. "solinco-hyper-g-125-set" */
  id: string;
  /** The string slug this product belongs to (matches strings.csv slug) */
  stringSlug: string;
  /** Human label, e.g. "12m Set — 1.25mm (17g)" */
  label: string;
  /** e.g. "1.25mm" */
  gauge: string;
  /** "set" | "reel" */
  packType: 'set' | 'reel';
  /** Metres in reel (null for sets) */
  reelMetres: number | null;
}

/**
 * A retailer / merchant we compare prices for.
 */
export interface PCMerchant {
  /** Unique ID, e.g. "amazon-uk", "racquetdepot-uk" */
  id: string;
  name: string;
  region: PCRegion;
  currency: PCCurrency;
  logoUrl: string | null;
  /**
   * Phase 2: how we fetch prices automatically.
   * 'manual' = admin updates price_checks.json by hand.
   * 'api'    = call provider_config.endpoint (Amazon PA-API, etc).
   * 'scrape' = CSS-selector scrape of product page.
   */
  provider: PCProvider;
  /** Phase 2 config — ignored when provider === 'manual' */
  provider_config: Record<string, unknown> | null;
}

/**
 * An affiliate URL for a specific (product × merchant) pair.
 */
export interface PCMerchantLink {
  id: string;
  productId: string;
  merchantId: string;
  /** Full affiliate URL; null = use merchant's search fallback */
  url: string | null;
  /** ASIN for Amazon merchants (used by Phase 2 PA-API lookup) */
  asin: string | null;
}

/**
 * A recorded price observation.
 */
export interface PCPriceCheck {
  id: string;
  merchantLinkId: string;
  /** Price in the merchant's currency; null if out-of-stock / unknown */
  price: number | null;
  currency: PCCurrency;
  inStock: boolean;
  checkedAt: string; // ISO 8601
}

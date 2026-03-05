/**
 * lib/price-comparison.ts
 *
 * Query functions over the JSON data store in data/price-comparison/.
 * Uses static imports so data is bundled at build time (no runtime fs reads in production).
 *
 * Phase 2: replace static JSON imports with API calls / PA-API fetches when
 * provider !== 'manual' on a PCMerchant.
 */

import type {
  PCProduct,
  PCMerchant,
  PCMerchantLink,
  PCPriceCheck,
  PCRegion,
} from '@/types/price-comparison';

import productsData      from '@/data/price-comparison/products.json';
import merchantsData     from '@/data/price-comparison/merchants.json';
import merchantLinksData from '@/data/price-comparison/merchant-links.json';
import priceChecksData   from '@/data/price-comparison/price-checks.json';

// Cast from JSON — the JSON shape matches the TypeScript interfaces exactly.
const products: PCProduct[]          = productsData      as PCProduct[];
const merchants: PCMerchant[]        = merchantsData     as PCMerchant[];
const merchantLinks: PCMerchantLink[] = merchantLinksData as PCMerchantLink[];
const priceChecks: PCPriceCheck[]    = priceChecksData   as PCPriceCheck[];

// ─── Basic lookups ─────────────────────────────────────────────────────────────

export function getProductsForString(stringSlug: string): PCProduct[] {
  return products.filter((p) => p.stringSlug === stringSlug);
}

export function getMerchantsByRegion(region: PCRegion): PCMerchant[] {
  return merchants.filter((m) => m.region === region);
}

export function getLinksForProduct(productId: string): PCMerchantLink[] {
  return merchantLinks.filter((l) => l.productId === productId);
}

/** Latest price check for a merchant link (most recent checkedAt). */
export function getLatestPriceCheck(merchantLinkId: string): PCPriceCheck | null {
  const checks = priceChecks
    .filter((c) => c.merchantLinkId === merchantLinkId)
    .sort((a, b) => (a.checkedAt > b.checkedAt ? -1 : 1));
  return checks[0] ?? null;
}

// ─── Aggregated view ──────────────────────────────────────────────────────────

export interface PCRow {
  merchant: PCMerchant;
  link: PCMerchantLink;
  latestCheck: PCPriceCheck | null;
}

/**
 * Returns all rows for a (product × region) combination, sorted cheapest first
 * (unknowns last). Empty array = no PC data for this combo.
 */
export function getPriceRows(productId: string, region: PCRegion): PCRow[] {
  const links = getLinksForProduct(productId);
  const rows: PCRow[] = [];

  for (const link of links) {
    const merchant = merchants.find((m) => m.id === link.merchantId);
    if (!merchant || merchant.region !== region) continue;
    const latestCheck = getLatestPriceCheck(link.id);
    rows.push({ merchant, link, latestCheck });
  }

  return rows.sort((a, b) => {
    const pa = a.latestCheck?.price ?? Infinity;
    const pb = b.latestCheck?.price ?? Infinity;
    return pa - pb;
  });
}

/**
 * True if there is any PC data for this string slug (any region, any product).
 * Used by string pages to decide whether to render PriceComparison vs WhereToBuy.
 */
export function hasPCData(stringSlug: string): boolean {
  return products.some((p) => p.stringSlug === stringSlug);
}

// ─── Admin helpers (also used in admin page) ──────────────────────────────────

export { products, merchants, merchantLinks, priceChecks };

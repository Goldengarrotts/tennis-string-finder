/**
 * lib/affiliateLinks.ts
 *
 * Wraps a product URL with the appropriate affiliate tracking link for each
 * supported retailer. Only store the plain product page URL in the CSV — this
 * module converts it to a tracked URL automatically.
 *
 * Supported retailers
 * ───────────────────
 * amazon        — handled separately via lib/amazon.ts (search URL + tag param)
 * racquetdepot  — https://a.racquetdepot.co.uk/479.html?url={encodedProductUrl}
 * tennisWarehouse — no affiliate wrapper currently; returns productUrl as-is
 * tennisPoint     — no affiliate wrapper currently; returns productUrl as-is
 * other           — returns productUrl as-is
 *
 * Adding a new retailer
 * ─────────────────────
 * 1. Add a case to the switch below.
 * 2. Update RETAILER_LABELS in WhereToBuy.tsx if it's a new retailer key.
 */

const RACQUET_DEPOT_BASE = 'https://a.racquetdepot.co.uk/479.html';

/**
 * Returns the affiliate-tracked URL for the given retailer.
 *
 * @param retailer  Retailer key matching the CSV `retailer` column
 * @param productUrl  The plain product page URL stored in the CSV
 * @returns  Tracked URL, or `productUrl` unchanged if no tracking is configured
 */
export function buildAffiliateLink(retailer: string, productUrl: string): string {
  if (!productUrl) return productUrl;

  switch (retailer) {
    case 'racquetdepot':
      // URLs that already start with the affiliate domain are FINAL — return unchanged.
      if (productUrl.startsWith('https://a.racquetdepot.co.uk/')) return productUrl;
      return `${RACQUET_DEPOT_BASE}?url=${encodeURIComponent(productUrl)}`;

    // Amazon is handled by buildAmazonSearchUrl in lib/amazon.ts
    case 'amazon':
    case 'tennisWarehouse':
    case 'tennisPoint':
    case 'other':
    default:
      return productUrl;
  }
}

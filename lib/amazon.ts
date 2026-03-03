/**
 * lib/amazon.ts
 *
 * Builds Amazon product-search affiliate URLs for US, UK, and EU stores.
 * No PA-API required — uses the standard /s?k= search endpoint.
 *
 * ─── SETUP ───────────────────────────────────────────────────────────────────
 * 1. Create .env.local in the project root (already git-ignored by Next.js):
 *
 *      NEXT_PUBLIC_AMAZON_TAG_US=yourstore-20
 *      NEXT_PUBLIC_AMAZON_TAG_UK=yourstore-21
 *      NEXT_PUBLIC_AMAZON_TAG_EU=yourstore-22   # optional — omit if no EU account
 *
 * 2. Add the same three vars in Vercel → Project → Settings → Environment Variables
 *    (set Environment = Production + Preview + Development for each).
 *
 * ─── ADDING A NEW PRODUCT ────────────────────────────────────────────────────
 * In data/retail_links.csv, add an Amazon row with the url field left EMPTY:
 *
 *   string,my-new-string,amazon,US,,true,,,
 *   string,my-new-string,amazon,UK,,true,,,
 *
 * The WhereToBuy component will auto-generate the search URL from the item name.
 * When you have a real ASIN, fill in the url field to use a direct product link.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DOMAINS: Record<'US' | 'UK' | 'EU', string> = {
  US: 'amazon.com',
  UK: 'amazon.co.uk',
  EU: 'amazon.de',
};

// NEXT_PUBLIC_ prefix makes these vars available in the browser bundle.
const TAGS: Record<'US' | 'UK' | 'EU', string | undefined> = {
  US: process.env.NEXT_PUBLIC_AMAZON_TAG_US,
  UK: process.env.NEXT_PUBLIC_AMAZON_TAG_UK,
  EU: process.env.NEXT_PUBLIC_AMAZON_TAG_EU,
};

export function buildAmazonSearchUrl({
  query,
  region,
}: {
  query: string;
  region: 'US' | 'UK' | 'EU';
}): string {
  const domain = DOMAINS[region];
  const tag    = TAGS[region];
  const k      = encodeURIComponent(query);
  const base   = `https://www.${domain}/s?k=${k}`;
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
}

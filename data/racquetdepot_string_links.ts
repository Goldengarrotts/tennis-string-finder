/**
 * data/racquetdepot_string_links.ts
 *
 * Source of truth for Racquet Depot affiliate links on string pages.
 * Each `url` is the FINAL affiliate link manually created in the Racquet Depot
 * affiliate portal. lib/affiliateLinks.ts passes these through unchanged
 * (safeguard: if url starts with https://a.racquetdepot.co.uk/ → return as-is).
 *
 * Run: npm run racquetdepot:import-strings
 * Then: npm run data:build
 */

export interface RacquetDepotStringLink {
  itemSlug: string;
  region: 'UK';
  /** FINAL affiliate URL from Racquet Depot portal — must not be wrapped. */
  url: string;
}

export const racquetDepotStringLinks: RacquetDepotStringLink[] = [
  { itemSlug: 'tecnifibre-tgv',            region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=317' },
  { itemSlug: 'gamma-synthetic-gut',        region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=316' },
  { itemSlug: 'head-synthetic-gut-pps',     region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=315' },
  { itemSlug: 'wilson-synthetic-gut-power', region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=314' },
  { itemSlug: 'prince-synthetic-gut',       region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=313' },
  { itemSlug: 'wilson-natural-gut',         region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=312' },
  { itemSlug: 'babolat-vs-team',            region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=311' },
  { itemSlug: 'head-rip-control',           region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=310' },
  { itemSlug: 'wilson-sensation',           region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=309' },
  { itemSlug: 'tecnifibre-nrg2',            region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=307' },
  { itemSlug: 'head-velocity-mlt',          region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=306' },
  { itemSlug: 'prince-premier-control',     region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=305' },
  { itemSlug: 'tecnifibre-x-one-biphase',   region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=304' },
  { itemSlug: 'wilson-nxt',                 region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=303' },
  { itemSlug: 'babolat-rpm-power',          region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=302' },
  { itemSlug: 'luxilon-element',            region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=301' },
  { itemSlug: 'weiss-cannon-ultra-cable',   region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=300' },
  { itemSlug: 'yonex-poly-tour-strike',     region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=299' },
  { itemSlug: 'signum-pro-tornado',         region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=298' },
  { itemSlug: 'tecnifibre-pro-red-code',    region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=297' },
  { itemSlug: 'wilson-revolve-spin',        region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=296' },
  { itemSlug: 'head-lynx-tour',             region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=295' },
  { itemSlug: 'solinco-confidential',       region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=294' },
  { itemSlug: 'babolat-rpm-soft',           region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=293' },
  { itemSlug: 'luxilon-4g-rough',           region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=292' },
  { itemSlug: 'luxilon-4g',                 region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=291' },
  { itemSlug: 'signum-pro-poly-plasma',     region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=290' },
  { itemSlug: 'yonex-poly-tour-pro',        region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=289' },
  { itemSlug: 'wilson-revolve',             region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=288' },
  { itemSlug: 'volkl-cyclone',              region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=287' },
  { itemSlug: 'head-hawk',                  region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=286' },
  { itemSlug: 'tecnifibre-black-code',      region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=285' },
  { itemSlug: 'solinco-tour-bite',          region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=284' },
  { itemSlug: 'luxilon-alu-power',          region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=283' },
  { itemSlug: 'solinco-hyper-g',            region: 'UK', url: 'https://a.racquetdepot.co.uk/home.php?id=479&url=282' },
];

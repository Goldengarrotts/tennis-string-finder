/**
 * lib/detectRegion.ts — server-only
 *
 * Reads the Vercel geo header (x-vercel-ip-country) and maps the ISO-3166-1
 * alpha-2 country code to the site's three-region model: US | UK | EU.
 * Falls back to 'US' on local dev or when the header is absent.
 */
import { headers } from 'next/headers';
import type { Region } from '@/data/retailLinks';

// EU member states + closely-aligned European markets that typically use EUR
// pricing and share Tennis Point / EU store availability.
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
  // Non-EU but share EU store/pricing
  'CH', 'NO', 'IS', 'LI',
]);

export async function detectRegion(): Promise<Region> {
  try {
    const hdrs = await headers();
    const country = (hdrs.get('x-vercel-ip-country') ?? '').toUpperCase().trim();
    if (country === 'US') return 'US';
    if (country === 'GB') return 'UK';
    if (EU_COUNTRIES.has(country)) return 'EU';
    // All other countries (AU, CA, JP, …) fall back to GLOBAL links;
    // the WhereToBuy component then renders whatever GLOBAL links exist,
    // defaulting to US links if none are found.
    return 'US';
  } catch {
    // headers() throws outside of a request context (static build, tests).
    return 'US';
  }
}

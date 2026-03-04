import type { MetadataRoute } from 'next';
import { strings } from '@/data/strings';
import { racquets } from '@/data/racquets';

/**
 * Sitemap — served automatically at /sitemap.xml by Next.js.
 *
 * Set NEXT_PUBLIC_SITE_URL in .env.local and in Vercel → Environment Variables
 * so the URLs point to your real domain:
 *   NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
 */
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tennisstringfinder.com').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/finder`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/strings`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/racquets`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/about`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/disclosure`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/terms`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ];

  const stringRoutes: MetadataRoute.Sitemap = strings.map((s) => ({
    url:             `${BASE}/strings/${s.slug}`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.7,
  }));

  const racquetRoutes: MetadataRoute.Sitemap = racquets.map((r) => ({
    url:             `${BASE}/racquets/${r.slug}`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.7,
  }));

  const bestStringsRoutes: MetadataRoute.Sitemap = racquets.map((r) => ({
    url:             `${BASE}/racquets/${r.slug}/best-strings`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.85, // programmatic SEO pages — high value
  }));

  return [
    ...staticRoutes,
    ...stringRoutes,
    ...racquetRoutes,
    ...bestStringsRoutes,
  ];
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { retailLinks } from '@/data/retailLinks';
import type { ItemType, Region, RetailLink } from '@/data/retailLinks';
import { buildAmazonSearchUrl } from '@/lib/amazon';

const REGIONS: { key: Region; label: string }[] = [
  { key: 'US', label: 'US' },
  { key: 'UK', label: 'UK' },
  { key: 'EU', label: 'EU' },
];

const RETAILER_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  tennisWarehouse: 'Tennis Warehouse',
  tennisPoint: 'Tennis Point',
  other: 'Retailer',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
};

const LS_KEY = 'wtb_region';

interface Props {
  itemType: ItemType;
  itemSlug: string;
  itemName: string;
  defaultRegion?: Region;
  compact?: boolean;
}

function formatPrice(price: number | null, currency: string | null): string {
  if (price === null || currency === null) return 'Check price';
  const symbol = CURRENCY_SYMBOLS[currency] ?? '';
  return `${symbol}${price.toFixed(2)}`;
}

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/** Resolve the href for a link. Amazon rows with an empty url get an auto-generated search URL. */
function resolveUrl(link: RetailLink, itemName: string): string {
  if (link.retailer === 'amazon' && !link.url) {
    const region = link.region === 'UK' ? 'UK' : link.region === 'EU' ? 'EU' : 'US';
    return buildAmazonSearchUrl({ query: itemName, region });
  }
  return link.url;
}

function sortLinks(links: RetailLink[]): RetailLink[] {
  const anyHasPrice = links.some((l) => l.price !== null);
  if (anyHasPrice) {
    return [...links].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  }
  return [...links].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
}

export default function WhereToBuy({
  itemType,
  itemSlug,
  itemName,
  defaultRegion = 'US',
  compact = false,
}: Props) {
  const [region, setRegion] = useState<Region>(defaultRegion);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Region | null;
    if (stored && (['US', 'UK', 'EU'] as Region[]).includes(stored)) {
      setRegion(stored);
    }
  }, []);

  function handleRegionChange(r: Region) {
    setRegion(r);
    setShowAll(false);
    try { localStorage.setItem(LS_KEY, r); } catch { /* private browsing */ }
  }

  // Filter to this item, then by region with fallbacks
  const itemLinks = retailLinks.filter(
    (l) => l.itemType === itemType && l.itemSlug === itemSlug,
  );

  let regionLinks: RetailLink[];
  if (itemLinks.length === 0) {
    // No CSV rows for this item — synthesise an Amazon search link for the current region
    // so every product page always has at least one CTA.
    regionLinks = [{ itemType, itemSlug, retailer: 'amazon', region, url: '', isPrimary: true, price: null, currency: null, lastCheckedISO: null }];
  } else {
    regionLinks = itemLinks.filter((l) => l.region === region);
    if (regionLinks.length === 0) regionLinks = itemLinks.filter((l) => l.region === 'GLOBAL');
    if (regionLinks.length === 0) regionLinks = itemLinks;
  }

  const sorted = sortLinks(regionLinks);
  const [best, ...rest] = sorted;

  // Price-aware "show more" logic
  const anyHasPrice = sorted.some((l) => l.price !== null);
  const primaryRest  = rest.filter((l) => l.isPrimary);
  const hasMore      = !anyHasPrice && rest.some((l) => !l.isPrimary);
  const displayRest  = anyHasPrice || showAll ? rest : primaryRest;

  // "Price last checked" — earliest ISO date across all shown links with a price
  const checkedDates = sorted
    .filter((l) => l.lastCheckedISO !== null && l.price !== null)
    .map((l) => l.lastCheckedISO as string)
    .sort();
  const latestChecked = checkedDates.at(-1) ?? null;

  const wrapperClass = compact
    ? 'mt-3 pt-3 border-t border-gray-100'
    : 'bg-white border border-gray-200 rounded-xl p-5';

  return (
    <div className={wrapperClass}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm' : ''}`}>
          Where to buy
        </h3>
        <div className="flex gap-1">
          {REGIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleRegionChange(key)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                region === key
                  ? 'bg-court text-white border-court'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Best price card */}
      <a
        href={resolveUrl(best, itemName)}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`flex items-center justify-between w-full border-2 border-court/40 bg-court/5 rounded-xl mb-2 transition-colors hover:border-court/70 hover:bg-court/10 ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div>
          <p className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>
            {RETAILER_LABELS[best.retailer]}
          </p>
          <p className={`font-bold text-court ${compact ? 'text-base' : 'text-xl'}`}>
            {formatPrice(best.price, best.currency)}
          </p>
        </div>
        <span
          className={`bg-court text-white font-semibold rounded-lg whitespace-nowrap ${
            compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'
          }`}
        >
          View on {RETAILER_LABELS[best.retailer]} ↗
        </span>
      </a>

      {/* Secondary rows */}
      {displayRest.length > 0 && (
        <div className={`space-y-1.5 ${compact ? '' : 'mb-1'}`}>
          {displayRest.map((link, i) => (
            <a
              key={i}
              href={resolveUrl(link, itemName)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`flex items-center justify-between w-full border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors ${
                compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
              }`}
            >
              <span className="font-medium">{RETAILER_LABELS[link.retailer]}</span>
              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold ${
                    link.price !== null ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {formatPrice(link.price, link.currency)}
                </span>
                <span className="text-gray-400 text-xs">↗</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Show more */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-gray-400 hover:text-court mt-2 transition-colors"
        >
          Show more retailers
        </button>
      )}

      {/* Price last checked notice */}
      {latestChecked && (
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Price last checked: {formatDate(latestChecked)}. Prices may vary — verify on retailer site before purchasing.
        </p>
      )}

      {/* Affiliate disclaimer */}
      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
        Affiliate link — we may earn a commission at no extra cost to you.{' '}
        <Link href="/disclosure" className="underline hover:text-court">
          Learn more.
        </Link>
      </p>
    </div>
  );
}

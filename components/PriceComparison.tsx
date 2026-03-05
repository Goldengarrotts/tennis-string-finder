'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { buildAmazonSearchUrl } from '@/lib/amazon';
import { buildAffiliateLink } from '@/lib/affiliateLinks';
import { getProductsForString, getPriceRows, type PCRow } from '@/lib/price-comparison';
import type { PCRegion } from '@/types/price-comparison';

const REGIONS: { key: PCRegion; label: string }[] = [
  { key: 'UK', label: 'UK' },
  { key: 'US', label: 'US' },
  { key: 'EU', label: 'EU' },
];

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€' };
const LS_KEY = 'pc_region';

interface Props {
  stringSlug: string;
  stringName: string;
  defaultRegion?: PCRegion;
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return 'Check price';
  return `${CURRENCY_SYMBOLS[currency] ?? ''}${price.toFixed(2)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

/** Always uses Amazon search so the affiliate tag + product search works reliably. */
function resolveUrl(row: PCRow, stringName: string): string {
  const { link, merchant } = row;
  if (merchant.name.toLowerCase().includes('amazon')) {
    return buildAmazonSearchUrl({ query: stringName, region: merchant.region });
  }
  if (!link.url) return '#';
  return buildAffiliateLink('racquetdepot', link.url);
}

export default function PriceComparison({ stringSlug, stringName, defaultRegion = 'UK' }: Props) {
  // Only use the first set product for this string
  const products = getProductsForString(stringSlug).filter((p) => p.packType === 'set');
  if (products.length === 0) return null;
  const product = products[0];

  const [region, setRegion] = useState<PCRegion>(defaultRegion);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY) as PCRegion | null;
      if (stored && ['US', 'UK', 'EU'].includes(stored)) setRegion(stored);
    } catch { /* private browsing */ }
  }, []);

  function handleRegion(r: PCRegion) {
    setRegion(r);
    try { localStorage.setItem(LS_KEY, r); } catch { /* */ }
  }

  const rows = getPriceRows(product.id, region);

  const checkedDates = rows
    .filter((r) => r.latestCheck?.checkedAt)
    .map((r) => r.latestCheck!.checkedAt)
    .sort();
  const latestChecked = checkedDates.at(-1) ?? null;

  const [best, ...rest] = rows;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Where to buy</h3>
        <div className="flex gap-1">
          {REGIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleRegion(key)}
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

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-3 text-center">No pricing data for this region yet.</p>
      ) : (
        <>
          {/* Best price — prominent card */}
          <BuyRow
            row={best}
            rank={0}
            stringName={stringName}
            stringSlug={stringSlug}
            productId={product.id}
            region={region}
          />

          {/* Other retailers */}
          {rest.map((row, i) => (
            <BuyRow
              key={row.link.id}
              row={row}
              rank={i + 1}
              stringName={stringName}
              stringSlug={stringSlug}
              productId={product.id}
              region={region}
            />
          ))}
        </>
      )}

      {latestChecked && (
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Prices last checked: {formatDate(latestChecked)}. Verify on retailer site before buying.
        </p>
      )}

      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
        Affiliate links — we may earn a small commission at no extra cost to you.{' '}
        <Link href="/disclosure" className="underline hover:text-court">Learn more.</Link>
      </p>
    </div>
  );
}

function BuyRow({
  row, rank, stringName, stringSlug, productId, region,
}: {
  row: PCRow;
  rank: number;
  stringName: string;
  stringSlug: string;
  productId: string;
  region: PCRegion;
}) {
  const { merchant, latestCheck } = row;
  const price    = latestCheck?.price ?? null;
  const currency = latestCheck?.currency ?? merchant.currency;
  const isTop    = rank === 0;
  const href     = resolveUrl(row, stringName);

  function handleClick() {
    sendGAEvent('event', 'price_comparison_click', {
      string_slug: stringSlug,
      product_id:  productId,
      merchant:    merchant.id,
      region,
      price:       price ?? 'unknown',
      rank:        rank + 1,
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={`flex items-center justify-between w-full rounded-xl transition-colors ${
        isTop
          ? 'border-2 border-court/40 bg-court/5 hover:border-court/70 hover:bg-court/10 px-4 py-3 mb-2'
          : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-2.5 mb-1.5'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isTop && (
          <span className="text-[10px] font-bold text-court bg-court/10 border border-court/30 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
            Best price
          </span>
        )}
        <p className="font-semibold text-gray-800 text-sm truncate">{merchant.name}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-3">
        <p className={`font-bold ${isTop ? 'text-court text-xl' : 'text-gray-900 text-base'}`}>
          {formatPrice(price, currency)}
        </p>
        <span className={`font-semibold rounded-lg whitespace-nowrap ${
          isTop ? 'bg-court text-white text-sm px-4 py-2' : 'text-gray-400 text-xs'
        }`}>
          {isTop ? 'Buy ↗' : '↗'}
        </span>
      </div>
    </a>
  );
}

'use client';

import { sendGAEvent } from '@next/third-parties/google';
import {
  ENABLE_RACQUET_DEPOT_OFFER,
  ENABLE_RACQUET_DEPOT_BANNER,
} from '@/config/promotions';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Placement = 'string_page' | 'guide' | 'homepage';

type BannerSize = '300x250' | '336x280' | '728x90' | '160x600';

// ─── Constants ────────────────────────────────────────────────────────────────

const AFFILIATE_URL = 'https://a.racquetdepot.co.uk/479.html';

const BANNER_SRCS: Record<BannerSize, string> = {
  '300x250': 'https://a.racquetdepot.co.uk/media/banners/RD-300x250.jpg',
  '336x280': 'https://a.racquetdepot.co.uk/media/banners/RD-336x280.jpg',
  '728x90':  'https://a.racquetdepot.co.uk/media/banners/RD-728x90.jpg',
  '160x600': 'https://a.racquetdepot.co.uk/media/banners/RD-160x600.jpg',
};

const BANNER_DIMS: Record<BannerSize, { width: number; height: number }> = {
  '300x250': { width: 300,  height: 250 },
  '336x280': { width: 336,  height: 280 },
  '728x90':  { width: 728,  height: 90  },
  '160x600': { width: 160,  height: 600 },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Identifies where on the site this instance is rendered (used for GA4). */
  placement: Placement;
  /**
   * Banner size to show on desktop when ENABLE_RACQUET_DEPOT_BANNER is true.
   * Defaults to 300x250. Has no effect on mobile.
   */
  bannerSize?: BannerSize;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RacquetDepotOffer({ placement, bannerSize = '300x250' }: Props) {
  if (!ENABLE_RACQUET_DEPOT_OFFER) return null;

  const showBanner = ENABLE_RACQUET_DEPOT_BANNER;
  const dims = BANNER_DIMS[bannerSize];

  function track(type: 'coupon' | 'banner') {
    sendGAEvent('event', 'affiliate_click', {
      retailer:  'racquetdepot',
      placement,
      type,
    });
  }

  return (
    <div className="my-6 mx-auto max-w-[650px]">
      <div className="bg-[#f7f7f7] border border-gray-200 rounded-xl px-6 py-5 text-center">

        {/* Partner label */}
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Partner offer
        </p>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-2">
          Save 5% at Racquet Depot
        </h3>

        {/* Description + coupon pill */}
        <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-sm mx-auto">
          Use code{' '}
          <span className="inline-block bg-white border border-gray-300 text-gray-800 font-mono font-semibold text-xs px-2.5 py-0.5 rounded-full mx-0.5">
            TENNISSTRINGFINDER
          </span>{' '}
          for 5% off your entire order. Excludes stringing and ball machines.
        </p>

        {/* CTA button */}
        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="sponsored noopener"
          onClick={() => track('coupon')}
          className="inline-flex items-center gap-1.5 bg-court text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-court-dark active:scale-[0.98] transition-all"
        >
          Shop Racquet Depot
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>

        {/* Banner — desktop only, only when flag is on */}
        {showBanner && (
          <div
            className="hidden sm:flex justify-center mt-4"
            style={{ minHeight: dims.height }}
          >
            <a
              href={AFFILIATE_URL}
              target="_blank"
              rel="sponsored noopener"
              onClick={() => track('banner')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BANNER_SRCS[bannerSize]}
                alt="Racquet Depot — 5% off with code TENNISSTRINGFINDER"
                width={dims.width}
                height={dims.height}
                loading="lazy"
                className="rounded"
              />
            </a>
          </div>
        )}

        {/* Affiliate disclosure */}
        <p className="text-[11px] text-gray-400 mt-3">
          Affiliate link — we may earn a small commission at no extra cost to you.
        </p>

      </div>
    </div>
  );
}

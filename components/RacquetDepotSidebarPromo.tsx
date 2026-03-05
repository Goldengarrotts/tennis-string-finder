'use client';

/**
 * RacquetDepotSidebarPromo
 *
 * Three placements:
 *   "sidebar"          — desktop sidebar (300 × 600 banner, hidden on mobile)
 *   "mobile_inline"    — after first section in main content on mobile (300 × 250)
 *   "homepage_inline"  — centred inline block on the homepage (300 × 250)
 *
 * Usage pattern for pages that have a sidebar:
 *   1. Inside <aside>: <RacquetDepotSidebarPromo placement="sidebar" />
 *      (wrap in <div className="hidden lg:block"> so it only shows desktop)
 *   2. In main content after the first section:
 *      <div className="lg:hidden"><RacquetDepotSidebarPromo placement="mobile_inline" /></div>
 *
 * Only one is ever visible at a time → satisfies the one-promo-per-page rule.
 */

import { sendGAEvent } from '@next/third-parties/google';
import { ENABLE_RACQUET_DEPOT_PROMO } from '@/config/promotions';

// ─── Affiliate assets ─────────────────────────────────────────────────────────

const GENERIC_URL  = 'https://a.racquetdepot.co.uk/479.html';

const BANNER_300x600 = {
  href: 'https://a.racquetdepot.co.uk/479-4-1-16.html',
  src:  'https://a.racquetdepot.co.uk/media/banners/RD-300x600.jpg',
  w: 300, h: 600,
};

const BANNER_300x250 = {
  href: 'https://a.racquetdepot.co.uk/479-4-1-10.html',
  src:  'https://a.racquetdepot.co.uk/media/banners/RD-300x250.jpg',
  w: 300, h: 250,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type PromoPlacement = 'sidebar' | 'mobile_inline' | 'homepage_inline';

interface Props {
  placement: PromoPlacement;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CouponPill() {
  return (
    <span className="inline-block bg-ball/10 border border-ball/40 text-court font-mono font-bold text-xs px-3 py-1 rounded-full tracking-wider">
      TENNISSTRINGFINDER
    </span>
  );
}

function ShopLink({ onClick }: { onClick: () => void }) {
  return (
    <a
      href={GENERIC_URL}
      target="_blank"
      rel="sponsored noopener"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-court font-semibold text-xs hover:underline"
    >
      Shop Racquet Depot
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  );
}

// ─── Sidebar variant (300 × 600, desktop only) ────────────────────────────────

function SidebarTall({ track }: { track: (type: 'banner' | 'text_link') => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Accent bar + label */}
      <div className="bg-court px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-ball uppercase tracking-widest">
          Partner deal
        </span>
        <span className="text-[10px] text-green-200 font-medium">Save 5%</span>
      </div>

      {/* Banner image — eager so it loads even when initially inside a hidden/responsive container */}
      <a
        href={BANNER_300x600.href}
        target="_blank"
        rel="sponsored noopener"
        onClick={() => track('banner')}
        className="block"
        style={{ lineHeight: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BANNER_300x600.src}
          alt="Racquet Depot — 5% off with code TENNISSTRINGFINDER"
          width={BANNER_300x600.w}
          height={BANNER_300x600.h}
          loading="eager"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </a>

      {/* Text content below banner */}
      <div className="px-4 py-4 text-center space-y-2">
        <p className="font-bold text-gray-900 text-sm">Save 5% at Racquet Depot</p>
        <CouponPill />
        <p className="text-[11px] text-gray-400 leading-relaxed">
          5% off sitewide · excludes stringing &amp; ball machines
        </p>
        <ShopLink onClick={() => track('text_link')} />
        <p className="text-[10px] text-gray-300 pt-1">
          Affiliate link — we may earn a commission.
        </p>
      </div>
    </div>
  );
}

// ─── Compact variant (300 × 250, mobile / homepage) ───────────────────────────

function CompactInline({
  track,
  centered,
}: {
  track: (type: 'banner' | 'text_link') => void;
  centered: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden${centered ? ' mx-auto max-w-[340px]' : ''}`}>
      {/* Accent bar */}
      <div className="bg-court px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-ball uppercase tracking-widest">
          Partner deal
        </span>
        <span className="text-[10px] text-green-200 font-medium">Save 5%</span>
      </div>

      {/* Banner */}
      <a
        href={BANNER_300x250.href}
        target="_blank"
        rel="sponsored noopener"
        onClick={() => track('banner')}
        className="block"
        style={{ lineHeight: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BANNER_300x250.src}
          alt="Racquet Depot — 5% off with code TENNISSTRINGFINDER"
          width={BANNER_300x250.w}
          height={BANNER_300x250.h}
          loading="eager"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </a>

      {/* Text */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="font-bold text-gray-900 text-sm">Save 5% at Racquet Depot</p>
          <div className="flex items-center gap-2 flex-wrap">
            <CouponPill />
            <span className="text-[11px] text-gray-400">excl. stringing &amp; ball machines</span>
          </div>
        </div>
        <ShopLink onClick={() => track('text_link')} />
      </div>

      <p className="text-[10px] text-gray-300 px-4 pb-2">
        Affiliate link — we may earn a commission.
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function RacquetDepotSidebarPromo({ placement }: Props) {
  if (!ENABLE_RACQUET_DEPOT_PROMO) return null;

  function track(type: 'banner' | 'text_link') {
    sendGAEvent('event', 'affiliate_click', {
      retailer:  'racquetdepot',
      placement,
      type,
      code:      'TENNISSTRINGFINDER',
    });
  }

  if (placement === 'sidebar') {
    return <SidebarTall track={track} />;
  }

  return (
    <CompactInline
      track={track}
      centered={placement === 'homepage_inline'}
    />
  );
}

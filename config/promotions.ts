/**
 * config/promotions.ts — Feature flags for promotional content.
 * Flip ENABLE_RACQUET_DEPOT_PROMO to false to hide all Racquet Depot promos sitewide.
 */

export const ENABLE_RACQUET_DEPOT_PROMO = true;

// Legacy flags (kept for backward compat — superseded by ENABLE_RACQUET_DEPOT_PROMO)
export const ENABLE_RACQUET_DEPOT_OFFER  = true;
export const ENABLE_RACQUET_DEPOT_BANNER = false;

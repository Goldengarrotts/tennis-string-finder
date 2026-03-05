'use server';

import fs from 'fs';
import path from 'path';
import type { PCMerchantLink, PCPriceCheck } from '@/types/price-comparison';

const DATA_DIR = path.join(process.cwd(), 'data', 'price-comparison');

function readJson<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

function writeJson(filename: string, data: unknown): void {
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2) + '\n',
    'utf-8',
  );
}

// ─── Update affiliate URL for a merchant link ─────────────────────────────────

export async function updateMerchantLinkUrl(
  linkId: string,
  url: string,
  asin: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const links = readJson<PCMerchantLink[]>('merchant-links.json');
    const idx   = links.findIndex((l) => l.id === linkId);
    if (idx === -1) return { ok: false, error: 'Link not found' };
    links[idx] = { ...links[idx], url: url || null, asin: asin || null };
    writeJson('merchant-links.json', links);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Record a new price check ─────────────────────────────────────────────────

export async function addPriceCheck(
  merchantLinkId: string,
  price: number | null,
  currency: string,
  inStock: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const checks = readJson<PCPriceCheck[]>('price-checks.json');
    const id     = `pc-${merchantLinkId}-${Date.now()}`;
    checks.push({
      id,
      merchantLinkId,
      price,
      currency: currency as PCPriceCheck['currency'],
      inStock,
      checkedAt: new Date().toISOString(),
    });
    writeJson('price-checks.json', checks);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

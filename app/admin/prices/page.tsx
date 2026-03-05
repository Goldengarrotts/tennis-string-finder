/**
 * /admin/prices — Dev-only price comparison admin.
 *
 * Shows all products, their merchant links, latest prices, and lets you
 * update affiliate URLs and record new price checks.
 *
 * NOTE: This page uses fs.readFileSync at request time so you always see fresh
 * data without restarting the dev server. On Vercel (read-only filesystem) the
 * write actions will fail — manage data locally and deploy via git.
 */

import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { PCProduct, PCMerchant, PCMerchantLink, PCPriceCheck } from '@/types/price-comparison';
import { updateMerchantLinkUrl, addPriceCheck } from './actions';

// ─── Data loading (fresh FS read per request in dev) ─────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data', 'price-comparison');

function load<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')) as T;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ children, colour = 'gray' }: { children: React.ReactNode; colour?: 'green' | 'amber' | 'red' | 'gray' | 'blue' }) {
  const cls = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-red-700 border-red-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    gray:  'bg-gray-100 text-gray-600 border-gray-200',
  }[colour];
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

function UrlForm({ link, merchant }: { link: PCMerchantLink; merchant: PCMerchant }) {
  return (
    <form
      action={async (fd: FormData) => {
        'use server';
        await updateMerchantLinkUrl(
          link.id,
          fd.get('url') as string,
          fd.get('asin') as string | null,
        );
      }}
      className="flex flex-col gap-1.5 mt-2"
    >
      <input
        name="url"
        defaultValue={link.url ?? ''}
        placeholder="Affiliate URL (leave blank for Amazon search)"
        className="text-xs border border-gray-200 rounded px-2 py-1 w-full font-mono"
      />
      {merchant.name.toLowerCase().includes('amazon') && (
        <input
          name="asin"
          defaultValue={link.asin ?? ''}
          placeholder="ASIN (optional)"
          className="text-xs border border-gray-200 rounded px-2 py-1 w-full font-mono"
        />
      )}
      <button
        type="submit"
        className="self-start text-xs bg-court text-white px-3 py-1 rounded hover:bg-court/90 transition-colors"
      >
        Save URL
      </button>
    </form>
  );
}

function PriceForm({ link, merchant }: { link: PCMerchantLink; merchant: PCMerchant }) {
  return (
    <form
      action={async (fd: FormData) => {
        'use server';
        const price   = fd.get('price') ? parseFloat(fd.get('price') as string) : null;
        const inStock = fd.get('inStock') === 'true';
        await addPriceCheck(link.id, price, merchant.currency, inStock);
      }}
      className="flex flex-wrap gap-1.5 items-end mt-2"
    >
      <div>
        <label className="text-[10px] text-gray-400 block mb-0.5">
          Price ({merchant.currency})
        </label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g. 12.99"
          className="text-xs border border-gray-200 rounded px-2 py-1 w-28 font-mono"
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-400 block mb-0.5">In stock?</label>
        <select
          name="inStock"
          defaultValue="true"
          className="text-xs border border-gray-200 rounded px-2 py-1"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <button
        type="submit"
        className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
      >
        Record price
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPricesPage() {
  const products:      PCProduct[]      = load('products.json');
  const merchants:     PCMerchant[]     = load('merchants.json');
  const links:         PCMerchantLink[] = load('merchant-links.json');
  const priceChecks:   PCPriceCheck[]   = load('price-checks.json');

  // Index helpers
  const merchantById = Object.fromEntries(merchants.map((m) => [m.id, m]));
  const linksByProduct = (pid: string) => links.filter((l) => l.productId === pid);
  const latestCheck = (linkId: string) =>
    priceChecks
      .filter((c) => c.merchantLinkId === linkId)
      .sort((a, b) => (a.checkedAt > b.checkedAt ? -1 : 1))[0] ?? null;

  // Group products by stringSlug
  const slugs = [...new Set(products.map((p) => p.stringSlug))].sort();

  // Summary stats
  const totalLinks    = links.length;
  const missingUrl    = links.filter((l) => !l.url && !l.asin).length;
  const missingPrice  = links.filter((l) => !latestCheck(l.id)).length;
  const stale         = links.filter((l) => {
    const c = latestCheck(l.id);
    if (!c) return false;
    const days = (Date.now() - new Date(c.checkedAt).getTime()) / 86_400_000;
    return days > 14;
  }).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Price Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage affiliate URLs and price checks for the comparison tool.
            Changes write to <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">data/price-comparison/</code> — commit &amp; deploy to publish.
          </p>
        </div>
        <Link href="/" className="text-sm text-court hover:underline">← Site</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total links" value={totalLinks} />
        <StatCard label="Missing URL/ASIN" value={missingUrl} bad={missingUrl > 0} />
        <StatCard label="No price yet" value={missingPrice} bad={missingPrice > 0} />
        <StatCard label="Price > 14 days" value={stale} bad={stale > 0} />
      </div>

      {/* Products grouped by string */}
      <div className="space-y-10">
        {slugs.map((slug) => {
          const stringProducts = products.filter((p) => p.stringSlug === slug);
          return (
            <section key={slug}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bold text-gray-900">{slug}</h2>
                <Link
                  href={`/strings/${slug}`}
                  className="text-xs text-court hover:underline"
                  target="_blank"
                >
                  View page ↗
                </Link>
              </div>

              <div className="space-y-6">
                {stringProducts.map((product) => {
                  const productLinks = linksByProduct(product.id);
                  const noLinks = productLinks.length === 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-xl p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.label}</h3>
                        <Badge colour="blue">{product.packType}</Badge>
                        <Badge>{product.gauge}</Badge>
                        {noLinks && <Badge colour="red">No merchant links</Badge>}
                      </div>

                      {noLinks ? (
                        <p className="text-xs text-gray-400">
                          Add entries to <code className="font-mono bg-gray-100 px-1 rounded">merchant-links.json</code> for product ID{' '}
                          <code className="font-mono bg-gray-100 px-1 rounded">{product.id}</code>.
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {productLinks.map((link) => {
                            const merchant = merchantById[link.merchantId];
                            if (!merchant) return null;
                            const check = latestCheck(link.id);
                            const hasPrice = check?.price !== null && check !== null;
                            const isStale  = check
                              ? (Date.now() - new Date(check.checkedAt).getTime()) / 86_400_000 > 14
                              : false;

                            return (
                              <div key={link.id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="font-medium text-sm text-gray-800">{merchant.name}</p>
                                  <Badge colour={merchant.region === 'UK' ? 'blue' : merchant.region === 'US' ? 'green' : 'amber'}>
                                    {merchant.region}
                                  </Badge>
                                  {hasPrice && !isStale && (
                                    <Badge colour="green">
                                      {merchant.currency === 'GBP' ? '£' : merchant.currency === 'USD' ? '$' : '€'}
                                      {check!.price!.toFixed(2)} — fresh
                                    </Badge>
                                  )}
                                  {hasPrice && isStale && (
                                    <Badge colour="amber">
                                      {merchant.currency === 'GBP' ? '£' : merchant.currency === 'USD' ? '$' : '€'}
                                      {check!.price!.toFixed(2)} — stale
                                    </Badge>
                                  )}
                                  {!hasPrice && check && (
                                    <Badge colour="amber">Price unknown</Badge>
                                  )}
                                  {!check && (
                                    <Badge colour="red">No price recorded</Badge>
                                  )}
                                  {link.url && (
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-court hover:underline"
                                    >
                                      Visit link ↗
                                    </a>
                                  )}
                                </div>

                                <UrlForm link={link} merchant={merchant} />
                                <PriceForm link={link} merchant={merchant} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, bad }: { label: string; value: number; bad?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${bad && value > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
      <p className={`text-2xl font-extrabold ${bad && value > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

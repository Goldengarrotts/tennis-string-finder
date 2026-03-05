/**
 * scripts/sync-racquetdepot-links.ts
 *
 * Populates data/retail_links.csv with Racquet Depot (UK) rows for each string
 * by searching racquetdepot.co.uk and scoring results.
 *
 * Usage:
 *   npm run retailers:sync-racquetdepot
 *   npm run retailers:sync-racquetdepot -- --dry-run
 *   npm run retailers:sync-racquetdepot -- --force
 *   npm run retailers:sync-racquetdepot -- --limit 5
 *   npm run retailers:sync-racquetdepot -- --dry-run --limit 3
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as https from 'https';
import * as http from 'http';

// ─── CLI flags ────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const DRY_RUN    = args.includes('--dry-run');
const FORCE      = args.includes('--force');
const limitIdx   = args.indexOf('--limit');
const LIMIT      = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

const CONFIDENCE_THRESHOLD = 0.80;

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT            = process.cwd();
const DATA            = join(ROOT, 'data');
const REPORTS         = join(ROOT, 'scripts', 'reports');
const STRINGS_CSV     = join(DATA, 'strings.csv');
const RETAIL_CSV      = join(DATA, 'retail_links.csv');
const REPORT_CSV      = join(REPORTS, 'racquetdepot-unmatched.csv');

// ─── Colour helpers ───────────────────────────────────────────────────────────

const c = {
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
};

// ─── Gauge → mm lookup ────────────────────────────────────────────────────────

const GAUGE_TO_MM: Record<string, number> = {
  '15':  1.41, '15L': 1.38,
  '16':  1.30, '16L': 1.28,
  '17':  1.25, '17L': 1.22,
  '18':  1.20, '18L': 1.17,
  '19':  1.15, '20':  1.10,
};

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      fields.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function parseCSV(raw: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const dataLines = lines.filter(l => l.trim() && !l.trim().startsWith('#'));
  if (dataLines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVRow(dataLines[0]).map(h => h.trim());
  const rows = dataLines.slice(1).map(line => {
    const vals = parseCSVRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? '').trim(); });
    return row;
  });
  return { headers, rows };
}

// ─── HTTP fetch (no external deps) ───────────────────────────────────────────

function fetchUrl(url: string, retries = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.9',
        },
      },
      (res) => {
        // Follow redirects
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).toString();
          res.resume();
          fetchUrl(next, retries).then(resolve).catch(reject);
          return;
        }

        // Retry on server errors / rate-limiting
        if (res.statusCode === 429 || (res.statusCode && res.statusCode >= 500)) {
          res.resume();
          if (retries > 0) {
            setTimeout(() => fetchUrl(url, retries - 1).then(resolve).catch(reject), 3000);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => { body += chunk; });
        res.on('end', () => resolve(body));
      },
    );

    req.on('error', reject);
    req.setTimeout(20_000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const randomSleep = () => sleep(300 + Math.random() * 500);

// ─── Parse Racquet Depot search results HTML ──────────────────────────────────
// racquetdepot.co.uk is BigCommerce.
// Product links appear as:  <h2/3/4 ...><a href="/product-slug/?searchid=...">Title</a>
// We strip the query string from the URL to get the clean canonical product URL.

interface SearchResult {
  title: string;
  url:   string;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x3D;/g, '=')
    .replace(/&[a-z]+;/gi, '');
}

function parseSearchResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const seen    = new Set<string>();
  const baseUrl = 'https://www.racquetdepot.co.uk';

  // BigCommerce product links live inside heading tags
  const headingRe = /<h[2-4][^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = headingRe.exec(html)) !== null) {
    const attrs = m[1];
    const inner = m[2];

    // Extract href
    const hrefMatch = attrs.match(/href="([^"]+)"/i);
    if (!hrefMatch) continue;

    let href = decodeHtmlEntities(hrefMatch[1]);
    // Resolve relative URLs
    if (href.startsWith('/')) href = baseUrl + href;
    else if (!href.startsWith('http')) continue;

    // Strip search tracking query params — keep canonical URL only
    href = href.split('?')[0].replace(/\/$/, '');  // remove trailing slash too

    const title = decodeHtmlEntities(inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

    if (!seen.has(href) && title.length >= 4) {
      seen.add(href);
      results.push({ title, url: href });
    }
  }

  return results;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

interface StringEntry {
  slug:   string;
  brand:  string;
  name:   string;
  gauges: string[];
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    // Normalize common accented characters so Völkl === volkl, etc.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip combining diacritics
    .replace(/[^a-z0-9.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);       // drop single-char noise tokens
}

// Brands we recognise — used to penalise wrong-brand results
const KNOWN_BRANDS = new Set([
  'babolat', 'luxilon', 'wilson', 'head', 'solinco', 'tecnifibre',
  'yonex', 'dunlop', 'prince', 'volkl', 'signum', 'pro', 'polyfibre',
  'weiss', 'cannon', 'gamma', 'kirschbaum', 'topspin',
]);

function scoreResult(result: SearchResult, entry: StringEntry): number {
  const titleTokens = tokenize(result.title);
  const brandTokens = tokenize(entry.brand);
  const nameTokens  = tokenize(entry.name);

  // Brand match — weight 0.35
  const brandHits      = brandTokens.filter(t => titleTokens.includes(t)).length;
  const brandMatchRate = brandHits / Math.max(brandTokens.length, 1);

  // Disqualify immediately if brand doesn't match at all
  if (brandMatchRate === 0) return 0;

  // Model/name match — weight 0.45
  const nameHits      = nameTokens.filter(t => titleTokens.includes(t)).length;
  const nameMatchRate = nameHits / Math.max(nameTokens.length, 1);

  // Strict rule: for multi-token model names, all tokens must appear in the title.
  // A partial name match (e.g. "RPM" from "RPM Blast" matching "RPM Hurricane") must
  // not be enough to pass the threshold on its own.
  if (nameTokens.length > 1 && nameMatchRate < 1.0) {
    // Scale down the contribution dramatically — partial brand+name can't reach threshold
    const score = brandMatchRate * 0.25 + nameMatchRate * 0.20;
    return Math.min(score, 0.55);   // hard ceiling below threshold
  }

  let score = brandMatchRate * 0.35 + nameMatchRate * 0.45;

  // Gauge bonus — weight 0.20
  const mmValues = entry.gauges
    .map(g => GAUGE_TO_MM[g])
    .filter((v): v is number => v !== undefined);

  const gaugeMatch =
    mmValues.some(mm => result.title.includes(mm.toFixed(2)) || result.title.includes(mm.toFixed(1))) ||
    entry.gauges.some(g => result.title.toLowerCase().includes(g.toLowerCase()));

  if (gaugeMatch) score += 0.20;

  // Penalty: another known brand appears in the title
  // Normalise with the same pipeline as tokenize() so diacritics don't cause false positives
  const brandNorm  = tokenize(entry.brand).join(' ');
  const alienBrand = [...KNOWN_BRANDS].find(b => !brandNorm.includes(b) && titleTokens.includes(b));
  if (alienBrand) score *= 0.4;

  return Math.min(score, 1.0);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(c.bold('\n🎾  Racquet Depot link sync\n'));

  if (DRY_RUN)        console.log(c.yellow('  [--dry-run] no files will be written\n'));
  if (FORCE)          console.log(c.yellow('  [--force]   re-checking existing rows\n'));
  if (LIMIT < Infinity) console.log(c.yellow(`  [--limit ${LIMIT}]\n`));

  // ── Load strings ──────────────────────────────────────────────────────────
  const { rows: stringRows } = parseCSV(readFileSync(STRINGS_CSV, 'utf8'));
  const allStrings: StringEntry[] = stringRows.map(r => ({
    slug:   r.slug,
    brand:  r.brand,
    name:   r.name,
    gauges: r.gauges ? r.gauges.split('|').map(g => g.trim()).filter(Boolean) : [],
  }));

  const toProcess = LIMIT < Infinity ? allStrings.slice(0, LIMIT) : allStrings;

  // ── Load existing retail links ────────────────────────────────────────────
  const existingRaw = readFileSync(RETAIL_CSV, 'utf8');
  const { rows: existingRows } = parseCSV(existingRaw);

  // Set of itemType|itemSlug combos already covered by racquetdepot+UK
  const existingKeys = new Set(
    existingRows
      .filter(r => r.retailer === 'racquetdepot' && r.region === 'UK')
      .map(r => `${r.itemType}|${r.itemSlug}`),
  );

  // ── Process ───────────────────────────────────────────────────────────────
  const newRows:   string[] = [];
  const unmatched: { slug: string; name: string; query: string; reason: string }[] = [];

  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];
    const key   = `string|${entry.slug}`;

    process.stdout.write(
      `  [${i + 1}/${toProcess.length}] ${c.cyan(`${entry.brand} ${entry.name}`)} `,
    );

    if (existingKeys.has(key) && !FORCE) {
      console.log(c.dim('→ skip (exists)'));
      continue;
    }

    // Build queries: with primary gauge first, then without
    const primaryGauge    = entry.gauges[0] ?? '';
    const queryWithGauge  = primaryGauge
      ? `${entry.brand} ${entry.name} ${primaryGauge}`
      : `${entry.brand} ${entry.name}`;
    const queryWithout    = `${entry.brand} ${entry.name}`;
    const queries         = primaryGauge ? [queryWithGauge, queryWithout] : [queryWithout];

    let bestResult: SearchResult | null = null;
    let bestScore  = 0;
    let usedQuery  = queryWithGauge;
    let fetchFailed = false;

    for (const query of queries) {
      usedQuery = query;
      const searchUrl = `https://www.racquetdepot.co.uk/search.php?search_query=${encodeURIComponent(query)}`;

      let html: string;
      try {
        html = await fetchUrl(searchUrl);
      } catch (err) {
        console.log(c.red(`→ fetch error: ${err}`));
        unmatched.push({ slug: entry.slug, name: `${entry.brand} ${entry.name}`, query, reason: `fetch error: ${err}` });
        fetchFailed = true;
        break;
      }

      const results = parseSearchResults(html);

      for (const r of results) {
        const score = scoreResult(r, entry);
        if (score > bestScore) {
          bestScore  = score;
          bestResult = r;
        }
      }

      // Good match already — no need for fallback query
      if (bestScore >= CONFIDENCE_THRESHOLD) break;

      // Pause before fallback query
      if (query === queryWithGauge) await randomSleep();
    }

    if (fetchFailed) {
      await randomSleep();
      continue;
    }

    if (bestResult && bestScore >= CONFIDENCE_THRESHOLD) {
      const pct    = (bestScore * 100).toFixed(0);
      const title  = bestResult.title.length > 55
        ? bestResult.title.slice(0, 52) + '…'
        : bestResult.title;
      console.log(c.green(`→ matched (${pct}%) ${title}`));

      const now = new Date().toISOString();
      newRows.push(`string,${entry.slug},racquetdepot,UK,${bestResult.url},true,,,${now}`);
    } else {
      const reason = bestResult
        ? `low confidence ${(bestScore * 100).toFixed(0)}% — "${bestResult.title.slice(0, 40)}"`
        : 'no results found';
      console.log(c.yellow(`→ no match (${reason})`));
      unmatched.push({ slug: entry.slug, name: `${entry.brand} ${entry.name}`, query: usedQuery, reason });
    }

    await randomSleep();
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(
    `\n  ${c.bold('Done:')} ${c.green(String(newRows.length))} new rows  |  ${c.yellow(String(unmatched.length))} unmatched\n`,
  );

  // ── Write retail_links.csv ────────────────────────────────────────────────
  if (newRows.length > 0) {
    if (DRY_RUN) {
      console.log(c.yellow('  Planned additions (dry run):'));
      newRows.forEach(r => console.log(`    ${r}`));
      console.log();
    } else {
      // When --force is active, remove stale racquetdepot+UK rows for processed items
      // then append fresh ones so there are no duplicates.
      const processedKeys = FORCE
        ? new Set(toProcess.map(s => `string|${s.slug}`))
        : new Set<string>();

      let content: string;

      if (FORCE && processedKeys.size > 0) {
        // Rebuild file: keep all lines except stale racquetdepot+UK rows we're replacing
        const rawLines  = existingRaw.replace(/\r\n/g, '\n').split('\n');
        const filtered  = rawLines.filter(line => {
          const t = line.trim();
          if (!t || t.startsWith('#')) return true;      // preserve blanks + comments
          const cols = parseCSVRow(line);
          if (cols.length < 4) return true;
          const [iType, iSlug, retailer, region] = cols;
          if (retailer?.trim() === 'racquetdepot' && region?.trim() === 'UK') {
            return !processedKeys.has(`${iType?.trim()}|${iSlug?.trim()}`);
          }
          return true;
        });
        content = filtered.join('\n');
      } else {
        content = existingRaw;
      }

      // Ensure file ends with a newline before appending
      if (!content.endsWith('\n')) content += '\n';
      content += `# ── Added by sync-racquetdepot (${new Date().toISOString().slice(0, 10)}) ──\n`;
      content += newRows.join('\n') + '\n';

      writeFileSync(RETAIL_CSV, content, 'utf8');
      console.log(c.green(`  ✓ Wrote ${newRows.length} rows to data/retail_links.csv`));
      console.log(c.dim('    Run  npm run data:build  to regenerate the TypeScript data files.\n'));
    }
  }

  // ── Write unmatched report ────────────────────────────────────────────────
  if (!DRY_RUN) {
    if (!existsSync(REPORTS)) mkdirSync(REPORTS, { recursive: true });

    const reportLines = [
      'itemSlug,name,searchQuery,reason',
      ...unmatched.map(u => {
        const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
        return `${u.slug},${q(u.name)},${q(u.query)},${q(u.reason)}`;
      }),
    ];
    writeFileSync(REPORT_CSV, reportLines.join('\n') + '\n', 'utf8');

    if (unmatched.length > 0) {
      console.log(c.yellow(`  Review unmatched items: scripts/reports/racquetdepot-unmatched.csv`));
    } else {
      console.log(c.dim('  No unmatched items — report file cleared.'));
    }
    console.log();
  }
}

main().catch(err => {
  console.error(c.red('\n  Fatal:'), err);
  process.exit(1);
});

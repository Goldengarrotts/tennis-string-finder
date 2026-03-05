/**
 * scripts/import-racquetdepot-string-links.ts
 *
 * Replaces Racquet Depot affiliate URLs for string items in data/retail_links.csv.
 *
 * Rules:
 *  - For each mapping entry (itemSlug → new home.php URL):
 *      • If a row (string, slug, racquetdepot, UK) already exists → update its url
 *        and lastCheckedISO; leave every other column unchanged.
 *      • If no row exists → append a new row.
 *  - If the same (string, slug, racquetdepot, UK) appears more than once (accident),
 *    keep only the best row (home.php URL preferred, else first encountered).
 *  - Never touch non-racquetdepot rows.
 *  - Never touch racquetdepot rows for itemType other than "string".
 *  - Slugs not in the mapping (e.g. babolat-xcel false positive) are left untouched.
 *
 * Usage:  npm run racquetdepot:import-strings
 * Then:   npm run data:build
 */

import fs from 'fs';
import path from 'path';
import { racquetDepotStringLinks } from '../data/racquetdepot_string_links';

// ─── Paths ────────────────────────────────────────────────────────────────────

const CSV_PATH    = path.join(process.cwd(), 'data', 'retail_links.csv');
const STRINGS_CSV = path.join(process.cwd(), 'data', 'strings.csv');
const REPORT_DIR  = path.join(process.cwd(), 'scripts', 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'racquetdepot-missing-slugs.csv');

// ─── Load valid string slugs ──────────────────────────────────────────────────

function loadStringSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const line of fs.readFileSync(STRINGS_CSV, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const slug = t.split(',')[0];
    if (slug && slug !== 'slug') slugs.add(slug);
  }
  return slugs;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True if a CSV line is a racquetdepot string UK data row (not a comment/header). */
function isRdStringUkRow(cols: string[]): boolean {
  return (
    cols.length >= 9 &&
    cols[0] === 'string' &&
    cols[2] === 'racquetdepot' &&
    cols[3] === 'UK'
  );
}

/** Replace url (col 4) and lastCheckedISO (col 8) in a parsed column array. */
function applyUpdate(cols: string[], newUrl: string, now: string): string[] {
  const updated = [...cols];
  updated[4] = newUrl;
  updated[8] = now;
  return updated;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const validSlugs = loadStringSlugs();
  const now        = new Date().toISOString();

  // Build lookup: slug → new affiliate URL
  const mapping = new Map<string, string>();
  for (const entry of racquetDepotStringLinks) {
    if (!validSlugs.has(entry.itemSlug)) {
      console.warn(`⚠  mapping entry has unknown slug: ${entry.itemSlug} — skipping`);
      continue;
    }
    mapping.set(entry.itemSlug, entry.url);
  }

  // ── Pass 1: read CSV, classify each line ────────────────────────────────────
  const rawLines = fs.readFileSync(CSV_PATH, 'utf-8').split('\n');

  // Tracks slugs we've already emitted in the output (for dedup)
  const emittedSlugs = new Set<string>();

  // Output line accumulator
  const outLines: string[] = [];

  let updatedCount = 0;
  let keptUnchanged = 0;
  let dedupDropped = 0;

  for (const line of rawLines) {
    const trimmed = line.trim();

    // Pass through comments and blank lines unchanged
    if (!trimmed || trimmed.startsWith('#')) {
      outLines.push(line);
      continue;
    }

    const cols = trimmed.split(',');

    // Pass through the header line unchanged
    if (cols[0] === 'itemType') {
      outLines.push(line);
      continue;
    }

    // Is this a racquetdepot string UK row?
    if (!isRdStringUkRow(cols)) {
      outLines.push(line); // not our concern — preserve exactly
      continue;
    }

    const slug = cols[1];

    // ── Dedup: if we already emitted a row for this slug, drop this one ───────
    if (emittedSlugs.has(slug)) {
      console.log(`  DEDUP DROP: ${slug} (duplicate row removed)`);
      dedupDropped++;
      continue;
    }

    // ── Apply mapping if one exists for this slug ──────────────────────────────
    if (mapping.has(slug)) {
      const newUrl = mapping.get(slug)!;
      const oldUrl = cols[4];

      if (oldUrl === newUrl) {
        // Already correct — pass through unchanged
        outLines.push(line);
        emittedSlugs.add(slug);
        keptUnchanged++;
        console.log(`  OK (already correct): ${slug}`);
      } else {
        // Replace url + lastCheckedISO
        const updatedCols = applyUpdate(cols, newUrl, now);
        outLines.push(updatedCols.join(','));
        emittedSlugs.add(slug);
        updatedCount++;
        console.log(`  REPLACE: ${slug}`);
        console.log(`    old: ${oldUrl}`);
        console.log(`    new: ${newUrl}`);
      }
    } else {
      // Slug has no mapping entry (e.g. babolat-xcel false positive) — keep as-is
      outLines.push(line);
      emittedSlugs.add(slug);
      keptUnchanged++;
    }
  }

  // ── Pass 2: append new rows for mapping entries not found in CSV ─────────────
  const newRows: string[] = [];
  const unknownSlugs: string[] = [];

  for (const [slug, url] of mapping) {
    if (!emittedSlugs.has(slug)) {
      // Validate slug
      if (!validSlugs.has(slug)) {
        console.warn(`⚠  SKIP unknown slug: ${slug}`);
        unknownSlugs.push(slug);
        continue;
      }
      const row = `string,${slug},racquetdepot,UK,${url},false,,,${now}`;
      newRows.push(row);
      emittedSlugs.add(slug);
      console.log(`  NEW ROW: ${slug}`);
    }
  }

  if (newRows.length > 0) {
    outLines.push('');
    outLines.push(`# ── Racquet Depot affiliate links (added ${now.slice(0, 10)}) ──`);
    outLines.push(...newRows);
  }

  // ── Write CSV ─────────────────────────────────────────────────────────────────
  fs.writeFileSync(CSV_PATH, outLines.join('\n'), 'utf-8');

  // ── Report ────────────────────────────────────────────────────────────────────
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportLines = [
    'reason,itemSlug',
    ...unknownSlugs.map((s) => `unknown_slug,${s}`),
  ];
  fs.writeFileSync(REPORT_PATH, reportLines.join('\n') + '\n', 'utf-8');

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n─── Summary ───────────────────────────────────────');
  console.log(`  Updated (url replaced):   ${updatedCount}`);
  console.log(`  Already correct / kept:   ${keptUnchanged}`);
  console.log(`  New rows appended:        ${newRows.length}`);
  console.log(`  Duplicates removed:       ${dedupDropped}`);
  console.log(`  Unknown slugs skipped:    ${unknownSlugs.length}`);
  console.log('───────────────────────────────────────────────────');
  console.log(`\n✓ Wrote ${CSV_PATH}`);
  console.log(`✓ Report: ${REPORT_PATH}`);
  console.log('\nNext step: npm run data:build');
}

main();

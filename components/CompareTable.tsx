'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { strings } from '@/data/strings';
import type { TennisString } from '@/types';
import RatingBar from './RatingBar';

const ALL_RATINGS: (keyof TennisString['ratings'])[] = ['spin', 'power', 'control', 'comfort', 'durability'];

const TYPE_LABELS: Record<TennisString['type'], string> = {
  polyester: 'Polyester',
  multifilament: 'Multifilament',
  'natural-gut': 'Natural Gut',
  'synthetic-gut': 'Synthetic Gut',
};

const PRICE_LABELS: Record<TennisString['priceBand'], string> = {
  budget: '£ Budget',
  mid: '££ Mid-range',
  premium: '£££ Premium',
};

interface Props {
  initialSlugs: string[];
}

export default function CompareTable({ initialSlugs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string[]>(initialSlugs.slice(0, 3));
  const [addQuery, setAddQuery] = useState('');

  const compared = selected.map((slug) => strings.find((s) => s.slug === slug)).filter(Boolean) as TennisString[];

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.length > 0) {
      params.set('strings', selected.join(','));
    } else {
      params.delete('strings');
    }
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  }, [selected]);

  function remove(slug: string) {
    setSelected((prev) => prev.filter((s) => s !== slug));
  }

  function add(slug: string) {
    if (selected.includes(slug) || selected.length >= 3) return;
    setSelected((prev) => [...prev, slug]);
    setAddQuery('');
  }

  const filteredStrings = strings.filter(
    (s) =>
      !selected.includes(s.slug) &&
      (addQuery.length === 0 ||
        s.name.toLowerCase().includes(addQuery.toLowerCase()) ||
        s.brand.toLowerCase().includes(addQuery.toLowerCase()))
  );

  function getBest(rating: keyof TennisString['ratings']): string {
    if (compared.length === 0) return '';
    const max = Math.max(...compared.map((s) => s.ratings[rating]));
    const best = compared.find((s) => s.ratings[rating] === max);
    return best?.slug ?? '';
  }

  return (
    <div>
      {/* Add string picker */}
      {selected.length < 3 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Add a string to compare ({selected.length}/3):
          </p>
          <input
            type="text"
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
            placeholder="Search by name or brand…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-court mb-2"
          />
          {addQuery.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredStrings.slice(0, 8).map((s) => (
                <button
                  key={s.slug}
                  onClick={() => add(s.slug)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-sm transition-all"
                >
                  <span className="text-gray-400 text-xs">{s.brand} · </span>
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-gray-400 text-xs ml-1">({TYPE_LABELS[s.type]})</span>
                </button>
              ))}
              {filteredStrings.length === 0 && (
                <p className="text-sm text-gray-400 px-3 py-2">No matches found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {compared.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="font-medium text-gray-600">No strings selected</p>
          <p className="text-sm mt-1">Search above to add up to 3 strings to compare.</p>
        </div>
      )}

      {compared.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr>
                <th className="text-left py-3 pr-4 text-sm font-medium text-gray-500 w-32">Attribute</th>
                {compared.map((s) => (
                  <th key={s.slug} className="text-center pb-2 px-3">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 relative">
                      <button
                        onClick={() => remove(s.slug)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-400">{s.brand}</p>
                      <p className="font-bold text-gray-900 text-sm leading-tight mt-0.5">{s.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{TYPE_LABELS[s.type]}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Rating rows */}
              {ALL_RATINGS.map((rating) => {
                const bestSlug = getBest(rating);
                return (
                  <tr key={rating} className="border-t border-gray-100">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-600 capitalize">{rating}</td>
                    {compared.map((s) => (
                      <td key={s.slug} className="py-3 px-3 text-center">
                        <div className={`rounded-lg px-3 py-2 ${s.slug === bestSlug ? 'bg-court/5 border border-court/20' : ''}`}>
                          <span className={`text-xl font-bold ${s.slug === bestSlug ? 'text-court' : 'text-gray-700'}`}>
                            {s.ratings[rating]}
                          </span>
                          <span className="text-xs text-gray-400">/10</span>
                          {s.slug === bestSlug && compared.length > 1 && (
                            <p className="text-xs text-court font-medium mt-0.5">Best</p>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Type */}
              <tr className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm font-medium text-gray-600">Type</td>
                {compared.map((s) => (
                  <td key={s.slug} className="py-3 px-3 text-center text-sm text-gray-700">
                    {TYPE_LABELS[s.type]}
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm font-medium text-gray-600">Price</td>
                {compared.map((s) => (
                  <td key={s.slug} className="py-3 px-3 text-center text-sm text-gray-700">
                    {PRICE_LABELS[s.priceBand]}
                  </td>
                ))}
              </tr>

              {/* Shape */}
              <tr className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm font-medium text-gray-600">Shape</td>
                {compared.map((s) => (
                  <td key={s.slug} className="py-3 px-3 text-center text-sm text-gray-700 capitalize">
                    {s.shape}
                  </td>
                ))}
              </tr>

              {/* Arm-friendly */}
              <tr className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm font-medium text-gray-600">Arm-friendly</td>
                {compared.map((s) => (
                  <td key={s.slug} className="py-3 px-3 text-center">
                    <span className={`text-sm font-medium ${s.armFriendly ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.armFriendly ? '✓ Yes' : '✗ No'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Gauges */}
              <tr className="border-t border-gray-100">
                <td className="py-3 pr-4 text-sm font-medium text-gray-600">Gauges</td>
                {compared.map((s) => (
                  <td key={s.slug} className="py-3 px-3 text-center text-sm text-gray-700">
                    {s.gauges.join(', ')}
                  </td>
                ))}
              </tr>

              {/* View detail links */}
              <tr className="border-t border-gray-200">
                <td className="py-4 pr-4" />
                {compared.map((s) => (
                  <td key={s.slug} className="py-4 px-3 text-center">
                    <a
                      href={`/strings/${s.slug}`}
                      className="text-sm font-medium text-court hover:underline"
                    >
                      Full profile →
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Visual rating bars for mobile */}
      {compared.length > 0 && (
        <div className="mt-8 md:hidden space-y-6">
          {compared.map((s) => (
            <div key={s.slug} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-bold text-gray-900 mb-3">{s.brand} {s.name}</p>
              <div className="space-y-2">
                {ALL_RATINGS.map((r) => (
                  <RatingBar key={r} label={r} value={s.ratings[r]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

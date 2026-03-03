import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { strings } from '@/data/strings';
import StringsClient from '@/components/StringsClient';

export const metadata: Metadata = {
  title: `Browse Tennis Strings — ${strings.length} Strings Reviewed`,
  description: `Browse our full database of ${strings.length} tennis strings. Filter by type, price, and arm-friendliness. Compare any 3 side by side.`,
};

export default function StringsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse strings</h1>
          <p className="text-gray-500 mt-1">
            {strings.length} strings reviewed — find yours below.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/finder" className="btn-primary">
            Find my string →
          </Link>
          <Link href="/compare" className="btn-ghost border border-gray-200">
            Compare
          </Link>
        </div>
      </div>

      {/* Filter + string grid (all client-side) */}
      <Suspense>
        <StringsClient strings={strings} />
      </Suspense>
    </div>
  );
}

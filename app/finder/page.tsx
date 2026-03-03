import type { Metadata } from 'next';
import FinderWizard from '@/components/FinderWizard';
import { detectRegion } from '@/lib/detectRegion';

export const metadata: Metadata = {
  title: 'String Finder — Find Your Perfect Tennis String',
  description:
    'Answer 4 quick questions about your racquet, playing goals, and arm health. Get 3 personalised string recommendations with plain-English reasons.',
};

export default async function FinderPage() {
  const defaultRegion = await detectRegion();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <p className="text-court font-semibold text-sm uppercase tracking-widest mb-2">Guided wizard</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find your perfect string</h1>
        <p className="text-gray-500">
          Takes about 60 seconds. No account needed. We&apos;ll explain exactly why we recommend each string.
        </p>
      </div>
      <FinderWizard defaultRegion={defaultRegion} />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About StringLab',
  description: 'StringLab helps tennis players of all levels find the right string for their game with plain-English advice and unbiased comparisons.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About StringLab</h1>
      <p className="text-gray-500 text-lg mb-10">Plain-English string advice for every tennis player.</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <p>
          StringLab was built out of frustration. Every time we tried to find advice about tennis strings online,
          we hit a wall of jargon, conflicting forum posts, and YouTube videos 45 minutes long. All we wanted to know
          was: <em>which string should I put in my racquet?</em>
        </p>

        <p>
          StringLab answers that question simply. Tell us your racquet and what you care about — spin, comfort, control,
          power, or durability — and we&apos;ll give you three recommendations with clear, jargon-free reasons for each one.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">How our recommendations work</h2>
        <p>
          Our Finder uses a weighted scoring system. Your primary goal accounts for 70% of the score,
          your secondary goal for 30%. We then adjust for arm sensitivity (deprioritising stiff polys),
          string pattern (dense patterns benefit from higher-spin strings), and whether you&apos;re open to a hybrid setup.
        </p>
        <p>
          We don&apos;t accept payment to influence rankings. Every string is scored the same way, every time.
          Some product links are affiliate links — we earn a small commission if you buy through them,
          at no extra cost to you. This is how we keep the site running.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">Our data</h2>
        <p>
          String ratings are based on a combination of published manufacturer specs, pro stringing data,
          and extensive community testing. We aim to update and expand our database regularly. If you spot
          an error or want to suggest a string we&apos;re missing, we&apos;d love to hear from you.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">What&apos;s coming next</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>User accounts with saved setups and personal ratings</li>
          <li>Community &quot;popular setups&quot; per racquet</li>
          <li>&quot;People who strung this also tried&quot; recommendations</li>
          <li>More strings, more racquets, and tension calculators</li>
        </ul>

        <div className="bg-court/5 border border-court/20 rounded-xl p-6 mt-8">
          <p className="font-semibold text-gray-900 mb-2">Ready to find your string?</p>
          <p className="text-sm text-gray-600 mb-4">Takes about 60 seconds. No account needed.</p>
          <Link href="/finder" className="btn-primary inline-block">
            Open the String Finder →
          </Link>
        </div>
      </div>
    </div>
  );
}

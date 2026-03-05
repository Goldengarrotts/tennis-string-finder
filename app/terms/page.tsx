import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | TennisStringFinder',
  description: 'TennisStringFinder terms of use — how you may use our site and content.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Use</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: March 2025</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Acceptance of terms</h2>
          <p>
            By using TennisStringFinder, you agree to these terms. If you do not agree, please do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Content and accuracy</h2>
          <p>
            TennisStringFinder provides string and racquet information for general informational purposes only.
            While we strive for accuracy, we make no guarantees about the completeness, reliability,
            or suitability of our recommendations for your specific situation. Always consult a
            qualified stringer for professional advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Intellectual property</h2>
          <p>
            All original content on TennisStringFinder — including text, design, and code — is owned by TennisStringFinder.
            You may not reproduce or republish our content without permission. Brand names, trademarks,
            and product images remain the property of their respective owners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Limitation of liability</h2>
          <p>
            TennisStringFinder is not liable for any loss or damage arising from your use of this website or
            reliance on its recommendations. String choices are ultimately your responsibility.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to terms</h2>
          <p>
            We may update these terms at any time. Continued use of TennisStringFinder following changes
            constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}

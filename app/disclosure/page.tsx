import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | TennisStringFinder',
  description: 'TennisStringFinder affiliate disclosure — how we earn commissions and our commitment to unbiased advice.',
};

export default function DisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Disclosure</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: March 2025</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          TennisStringFinder participates in affiliate marketing programmes. This means some links on this website
          may be affiliate links — if you click one and make a purchase, we may earn a small commission
          at no additional cost to you.
        </p>
        <p>
          We only link to products we genuinely recommend. Affiliate relationships never influence our
          rankings, recommendations, or editorial content. Every string and racquet is assessed using
          the same criteria, regardless of whether we have an affiliate relationship with the manufacturer or retailer.
        </p>
        <p>
          This disclosure is provided in accordance with the FTC&apos;s guidelines concerning the use of
          endorsements and testimonials in advertising. If you have any questions about our affiliate
          relationships, please contact us.
        </p>
      </div>
    </div>
  );
}

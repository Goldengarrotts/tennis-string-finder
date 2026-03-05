import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TennisStringFinder',
  description: 'TennisStringFinder privacy policy — what data we collect and how we use it.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: March 2025</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">What we collect</h2>
          <p>
            TennisStringFinder does not require account creation for its core features. We do not collect
            personal data beyond standard server logs (IP addresses, browser type, pages visited)
            that are typical of any web service. These logs are used solely for debugging and
            performance monitoring.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
          <p>
            We may use cookies to remember UI preferences (such as compare selections). We do not
            use tracking cookies or third-party advertising cookies. If analytics are added in
            future, they will use privacy-respecting tools and this policy will be updated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Third-party links</h2>
          <p>
            TennisStringFinder contains links to third-party websites (retailers, manufacturers). We are not
            responsible for the privacy practices of those sites. Please review their privacy policies
            separately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Data retention</h2>
          <p>
            Server logs are retained for up to 30 days and then deleted. We do not sell, share,
            or otherwise transfer your data to third parties except as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
          <p>
            If you have questions about this policy or your data, please get in touch via the
            contact details listed on our About page.
          </p>
        </section>
      </div>
    </div>
  );
}

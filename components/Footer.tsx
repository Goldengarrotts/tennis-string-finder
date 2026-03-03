import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-court text-green-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎾</span>
              <span className="font-bold text-white text-lg">StringLab</span>
            </div>
            <p className="text-sm text-green-200 leading-relaxed">
              Find the right tennis string for your game. Plain-English advice for every level.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/finder" className="hover:text-ball transition-colors">String Finder</Link></li>
              <li><Link href="/strings" className="hover:text-ball transition-colors">Browse Strings</Link></li>
              <li><Link href="/racquets" className="hover:text-ball transition-colors">Racquet Guide</Link></li>
              <li><Link href="/compare" className="hover:text-ball transition-colors">Compare Strings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Info</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-ball transition-colors">About</Link></li>
              <li><Link href="/disclosure" className="hover:text-ball transition-colors">Affiliate Disclosure</Link></li>
              <li><Link href="/privacy" className="hover:text-ball transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ball transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-court-light mt-8 pt-6 text-xs text-green-300 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} StringLab. All rights reserved.</p>
          <p>
            Links may earn us a small commission at no cost to you.{' '}
            <Link href="/disclosure" className="underline hover:text-ball">Learn more.</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

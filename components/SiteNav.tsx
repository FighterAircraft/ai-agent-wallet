import Link from 'next/link';
import { SmartLink } from '@/components/SmartLink';
import { WALLET_URL } from '@/lib/site';

/**
 * Shared top navigation across the personal homepage (/me) and the
 * AI Agent Wallet app (/). Light theme to match the wallet UI.
 */
export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/me"
          className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-purple-600"
        >
          work<span className="text-purple-600">4</span>sky
        </Link>
        <div className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <Link
            href="/me"
            className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            个人主页
          </Link>
          <SmartLink
            href={WALLET_URL}
            className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-white transition hover:opacity-90"
          >
            🚀 AI Agent Wallet
          </SmartLink>
        </div>
      </div>
    </nav>
  );
}

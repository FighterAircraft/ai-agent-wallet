/**
 * Cross-domain site links.
 *
 * The app is served on two hostnames from the same Next process:
 *   - work4sky.com         → personal homepage (apex root rewritten to /me)
 *   - wallet.work4sky.com  → AI Agent Wallet app (root /)
 *
 * Because the apex root is rewritten to /me, an in-app `/` link would loop
 * back to the homepage instead of reaching the wallet. So the wallet link is
 * absolute in production (set via NEXT_PUBLIC_WALLET_URL at build time) and
 * falls back to the relative `/` for local development.
 */
export const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || '/';

export const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

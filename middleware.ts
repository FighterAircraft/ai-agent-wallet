import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Serve the personal homepage (/me) at the apex root work4sky.com, while the
 * wallet subdomain (wallet.work4sky.com) keeps the wallet app at /.
 * Only the root path is matched, so all other routes pass through untouched.
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0];
  const isApex = host === 'work4sky.com' || host === 'www.work4sky.com';

  if (isApex) {
    return NextResponse.rewrite(new URL('/me', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};

import Link from 'next/link';
import { isExternalUrl } from '@/lib/site';

/**
 * Renders a plain <a> for external/cross-domain URLs and a next/link <Link>
 * for internal routes. Lets the same href work whether it points to the wallet
 * subdomain (absolute, in prod) or an internal path (relative, local dev).
 */
export function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternalUrl(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

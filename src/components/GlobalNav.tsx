'use client';

import { GeistPixelSquare } from 'geist/font/pixel';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuthButton } from './AuthButton';

export function GlobalNav() {
  const pathname = usePathname();

  // Chat has its own sidebar with THUNDER + auth. Sign-in page doesn't need a sign-in button.
  const isChat = pathname.startsWith('/chat');
  const isSignIn = pathname.startsWith('/auth/signin');

  if (isChat) return null;

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className={`${GeistPixelSquare.className} text-sm uppercase tracking-wider text-text-primary hover:opacity-70 transition-opacity`}
        >
          THUNDER
        </Link>
      </div>
      {!isSignIn && (
        <div className="fixed top-4 right-4 z-50">
          <AuthButton />
        </div>
      )}
    </>
  );
}

'use client';

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
      {!isSignIn && (
        <div className="fixed top-4 right-4 z-50">
          <AuthButton />
        </div>
      )}
    </>
  );
}

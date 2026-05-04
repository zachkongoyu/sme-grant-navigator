'use client';

import { startTransition, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { PageLoadingIndicator } from '@/components/PageLoadingIndicator';

const NAVIGATION_START_EVENT = 'thunder:navigation-start';

export function beginNavigationProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}

function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    startTransition(() => setIsVisible(false));
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleNavigationStart() {
      setIsVisible(true);
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!isPlainLeftClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      if (anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (destination.origin !== current.origin) {
        return;
      }

      if (
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash === current.hash
      ) {
        return;
      }

      setIsVisible(true);
    }

    window.addEventListener(NAVIGATION_START_EVENT, handleNavigationStart);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, handleNavigationStart);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return <PageLoadingIndicator variant="top-bar" label="Loading page..." />;
}
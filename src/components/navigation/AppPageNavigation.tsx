'use client';

import { useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { BackNavigation } from './BackNavigation';
import {
  getFundraisingFlowNavigation,
  getRootFlowNavigation,
  getSchemeFlowNavigation,
  getShowcaseFlowNavigation,
} from '@/lib/navigation/policy';

function resolveNavigation(pathname: string, schemeId: string | null) {
  if (pathname === '/') {
    return null;
  }

  if (pathname.startsWith('/draft') || pathname.startsWith('/eligibility')) {
    return getSchemeFlowNavigation(schemeId ?? undefined);
  }

  if (pathname.startsWith('/fundraise/')) {
    return getFundraisingFlowNavigation();
  }

  if (pathname.startsWith('/showcase/') && pathname !== '/showcase') {
    return getShowcaseFlowNavigation();
  }

  return getRootFlowNavigation();
}

function subscribe(): () => void {
  return () => undefined;
}

function useIsHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function AppPageNavigation() {
  const isHydrated = useIsHydrated();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isHydrated) {
    return null;
  }

  const navigation = resolveNavigation(pathname, searchParams.get('scheme'));

  if (!navigation) {
    return null;
  }

  return (
    <div className="fixed top-6 left-6 z-50">
      <BackNavigation policy={navigation} />
    </div>
  );
}
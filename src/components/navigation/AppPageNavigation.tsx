'use client';

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

export function AppPageNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
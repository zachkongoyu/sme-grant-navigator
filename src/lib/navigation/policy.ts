import { FEATURED_SCHEME_ID } from '@/config/site';

export interface NavigationPolicy {
  readonly backHref: string;
  readonly homeHref: '/';
  readonly showHome: true;
}

const HOME_HREF = '/' as const;

export function getSchemeFlowNavigation(schemeId?: string): NavigationPolicy {
  return {
    backHref: `/schemes/${schemeId ?? FEATURED_SCHEME_ID}`,
    homeHref: HOME_HREF,
    showHome: true,
  };
}

export function getFundraisingFlowNavigation(): NavigationPolicy {
  return {
    backHref: '/fundraise',
    homeHref: HOME_HREF,
    showHome: true,
  };
}

export function getShowcaseFlowNavigation(): NavigationPolicy {
  return {
    backHref: '/showcase',
    homeHref: HOME_HREF,
    showHome: true,
  };
}

export function getRootFlowNavigation(): NavigationPolicy {
  return {
    backHref: HOME_HREF,
    homeHref: HOME_HREF,
    showHome: true,
  };
}
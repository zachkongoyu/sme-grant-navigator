export type SchemeId = string;

export type SchemeStatus = 'open' | 'active' | 'coming-soon' | 'closed';

export type SchemeCategory =
  | 'BUD Fund'
  | 'Trade Support'
  | 'Innovation'
  | 'Incubation'
  | 'Creative'
  | 'Financing'
  | 'Organisation Support'
  | 'Export'
  | 'Sustainability';

export interface SchemeLink {
  readonly label: string;
  readonly url: string;
}

export interface Scheme {
  readonly id: SchemeId;
  readonly name: string;
  readonly shortDescription: string;
  readonly category: SchemeCategory;
  readonly status: SchemeStatus;
  readonly fundingCap: number | null;
  readonly currency: string | null;
  readonly durationMonths: number | null;
  readonly links: ReadonlyArray<SchemeLink>;
  readonly draftable: boolean;
}
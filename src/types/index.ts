export type SchemeId = string;

export type SchemeStatus = 'active' | 'coming-soon' | 'closed';

export type SchemeCategory =
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

export interface DocumentChecklistEntry {
  readonly id: string;
  readonly label: string;
  readonly stage: 'application' | 'reimbursement';
  readonly note?: string;
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
  readonly documentChecklist?: ReadonlyArray<DocumentChecklistEntry>;
}

export interface DraftSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly isFree: boolean;
}
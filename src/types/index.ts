export type SchemeId = string;

export type SchemeStatus = 'open' | 'coming-soon' | 'closed';

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
  readonly databaseId: string | null;
  readonly corpus: string | null;
  readonly sourceUrl: string | null;
  readonly administrator: string | null;
  readonly updatedAt: string | null;
}

export interface AttachmentFile {
  readonly kind: 'file';
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly mime: string;
}

export interface LinkAttachment {
  readonly kind: 'link';
  readonly id: string;
  readonly url: string;
}

export type Attachment = AttachmentFile | LinkAttachment;

export interface ShortlistItem {
  readonly id: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly fundingCap: number | null;
  readonly currency: string | null;
}
export type SchemeId = string;

export type SchemeStatus = 'open' | 'coming-soon' | 'closed';

export interface SchemeLink {
  readonly label: string;
  readonly url: string;
}

export interface Scheme {
  readonly id: SchemeId;
  readonly name: string;
  readonly status: SchemeStatus;
  readonly maxFunding: number | null;
  readonly currency: string | null;
  readonly links: ReadonlyArray<SchemeLink>;
  readonly corpus: string | null;
  readonly sourceUrl: string | null;
  readonly administrator: string | null;
  readonly updatedAt: string | null;
  readonly jurisdiction: string;
  readonly nextDeadline: string | null;
  readonly version: number;
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
  readonly maxFunding: number | null;
  readonly currency: string | null;
}
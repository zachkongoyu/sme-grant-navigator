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

export const USER_ROLE_OPTIONS = [
  'Founder',
  'Co-founder',
  'CEO',
  'CFO',
  'CTO',
  'COO',
  'Product',
  'Engineer',
  'Designer',
  'Marketing',
  'BD',
  'Operations',
  'Advisor',
  'Investor',
  'Consultant',
] as const;

export type UserRole = typeof USER_ROLE_OPTIONS[number];

export interface ProfileLinks {
  linkedin?: string;
  x?: string;
  website?: string;
}

export type EntityType = 'human' | 'ai';

export interface Profile {
  readonly id: string;
  readonly display_name: string | null;
  readonly headline: string | null;
  readonly bio: string | null;
  readonly roles: string[];
  readonly location: string | null;
  readonly links: ProfileLinks;
  readonly is_public: boolean;
  readonly entity_type: EntityType;
  readonly credits_balance: number;
  readonly free_checks_used: number;
}

// ── Showcase / Project ──────────────────────────────────────────────────────

export const PROJECT_STAGES = ['idea', 'building', 'launched'] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const PROJECT_PLATFORMS = ['web', 'ios', 'android', 'chrome-extension', 'desktop', 'api'] as const;
export type ProjectPlatform = (typeof PROJECT_PLATFORMS)[number];

export const PROJECT_SECTORS = ['fintech', 'ai', 'healthtech', 'proptech', 'edtech', 'b2b', 'b2c', 'deeptech', 'other'] as const;
export type ProjectSector = (typeof PROJECT_SECTORS)[number];

export const PROJECT_SEEKING = ['investment', 'beta-users', 'co-founder', 'engineers', 'advisors', 'partnerships'] as const;
export type ProjectSeeking = (typeof PROJECT_SEEKING)[number];

export interface Project {
  id: string;
  slug: string;
  created_by: string;
  makers: string[];
  name: string;
  tagline: string | null;
  description: string | null;
  web_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  stage: ProjectStage | null;
  status: 'draft' | 'published';
  platform: string[];
  sector: string[];
  seeking: string[];
  traction: string | null;
  contact_url: string | null;
  created_at: string;
  updated_at: string;
}
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

export interface ChecklistEntry {
  readonly id: string;
  readonly label: string;
  readonly note?: string;
}

export interface ChecklistPayload {
  readonly now: ReadonlyArray<ChecklistEntry>;
  readonly later: ReadonlyArray<ChecklistEntry>;
}

export interface DraftPayload {
  /** Full markdown text of the generated draft. */
  readonly text: string;
}

export interface Artifact {
  readonly id: string;
  readonly kind: 'shortlist' | 'draft' | 'checklist' | 'note';
  readonly title: string;
  readonly payload: unknown;
}

export interface UserMessage {
  readonly id: string;
  readonly role: 'user';
  readonly text: string;
  readonly attachments: ReadonlyArray<Attachment>;
  readonly timestamp: number;
}

export interface AssistantMessage {
  readonly id: string;
  readonly role: 'assistant';
  readonly text: string;
  readonly artifacts: ReadonlyArray<Artifact>;
  readonly timestamp: number;
}

export interface SystemMessage {
  readonly id: string;
  readonly role: 'system';
  readonly text: string;
  readonly timestamp: number;
}

export type ChatMessage = UserMessage | AssistantMessage | SystemMessage;


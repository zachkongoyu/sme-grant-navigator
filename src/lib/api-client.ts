export {
  downloadDraftPdf,
  streamDraftGeneration,
  uploadDraftAttachments,
  type DraftInlineAttachment,
  type ExtractedAttachment,
} from '@/lib/api/draft-client';
export { fetchBookmarks, updateBookmark } from '@/lib/api/bookmarks-client';
export { createStripeCheckout } from '@/lib/api/payments-client';
export {
  readChatEventStream,
  streamChatResponse,
  type ChatStreamResult,
} from '@/lib/api/chat-client';
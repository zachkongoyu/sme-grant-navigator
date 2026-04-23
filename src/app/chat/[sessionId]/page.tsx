'use client';

import { use, useState } from 'react';

import { ChatLayout } from '@/components/chat/ChatLayout';
import type { Attachment } from '@/components/chat/types';
import { consumePending } from '@/lib/pending-sessions';

interface ChatSessionPageProps {
  readonly params: Promise<{ sessionId: string }>;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = use(params);

  // Consume the one-shot pending message stored by HeroComposer before router.push.
  // Returns undefined on direct URL access or page reload.
  const [seedMessage] = useState<
    { text: string; attachments: ReadonlyArray<Attachment> } | undefined
  >(() => consumePending(sessionId));

  return <ChatLayout sessionId={sessionId} {...(seedMessage && { seedMessage })} />;
}

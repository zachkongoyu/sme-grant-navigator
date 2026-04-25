'use client';

import { use, useEffect, useState } from 'react';

import { ChatLayout } from '@/components/chat/ChatLayout';
import type { Attachment } from '@/components/chat/types';
import { consumePending } from '@/lib/pending-sessions';

interface ChatSessionPageProps {
  readonly params: Promise<{ sessionId: string }>;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = use(params);
  const [paid, setPaid] = useState(false);

  // Consume the one-shot pending message stored by HeroComposer before router.push.
  const [seedMessage] = useState<
    { text: string; attachments: ReadonlyArray<Attachment> } | undefined
  >(() => consumePending(sessionId));

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((session) => setPaid(session?.paid ?? false))
      .catch(() => {});
  }, [sessionId]);

  return <ChatLayout sessionId={sessionId} paid={paid} {...(seedMessage && { seedMessage })} />;
}


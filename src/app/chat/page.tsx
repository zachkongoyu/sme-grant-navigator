'use client';

import { Suspense, useState } from 'react';

import { PageLoadingIndicator } from '@/components/PageLoadingIndicator';
import { ChatLayout } from '@/components/chat/ChatLayout';

function ChatPageInner() {
  const [sessionId] = useState(() => crypto.randomUUID());

  return <ChatLayout sessionId={sessionId} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<PageLoadingIndicator variant="inline" label="Opening chat..." />}>
      <ChatPageInner />
    </Suspense>
  );
}

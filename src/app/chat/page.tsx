'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { PageLoadingIndicator } from '@/components/PageLoadingIndicator';
import { ChatLayout } from '@/components/chat/ChatLayout';
import type { SystemMessage } from '@/components/chat/types';

function ChatPageInner() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const searchParams = useSearchParams();
  const schemeParam = searchParams.get('scheme');

  const schemeContext: SystemMessage | null = schemeParam
    ? {
        id: 'scheme-context',
        role: 'system',
        text: `Context: scheme = ${schemeParam}`,
        timestamp: 0,
      }
    : null;

  const initialMessages = schemeContext ? [schemeContext] : [];

  return <ChatLayout sessionId={sessionId} initialMessages={initialMessages} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<PageLoadingIndicator variant="inline" label="Opening chat..." />}>
      <ChatPageInner />
    </Suspense>
  );
}

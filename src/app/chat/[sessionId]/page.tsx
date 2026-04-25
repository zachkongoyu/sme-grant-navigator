'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { ChatLayout } from '@/components/chat/ChatLayout';
import type { Attachment } from '@/components/chat/types';
import { consumePending } from '@/lib/pending-sessions';

interface ChatSessionPageProps {
  readonly params: Promise<{ sessionId: string }>;
}

function ChatSessionContent({ sessionId }: { readonly sessionId: string }) {
  const searchParams = useSearchParams();
  // Initialise from the URL param so users arriving from Stripe's success_url
  // see the correct paid state immediately, with no flash.
  const [paid, setPaid] = useState(searchParams.get('paid') === 'true');

  const [seedMessage] = useState<
    { text: string; attachments: ReadonlyArray<Attachment> } | undefined
  >(() => consumePending(sessionId));

  useEffect(() => {
    if (paid) return; // URL param already confirmed payment; skip the fetch
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((session) => setPaid(session?.paid ?? false))
      .catch(() => {});
  }, [sessionId, paid]);

  return <ChatLayout sessionId={sessionId} paid={paid} {...(seedMessage && { seedMessage })} />;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = use(params);
  return (
    <Suspense>
      <ChatSessionContent sessionId={sessionId} />
    </Suspense>
  );
}



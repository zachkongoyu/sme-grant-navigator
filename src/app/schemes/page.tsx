import { redirect } from 'next/navigation';

import { FEATURED_SCHEME_ID } from '@/config/site';

export default function SchemesPage() {
  redirect(`/schemes/${FEATURED_SCHEME_ID}`);
}

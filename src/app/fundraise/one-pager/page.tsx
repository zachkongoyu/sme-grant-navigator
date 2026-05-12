import { requireUser } from '@/lib/auth';

import { OnePagerClient } from './OnePagerClient';

export default async function OnePagerPage() {
  await requireUser('/fundraise/one-pager');

  return <OnePagerClient />;
}

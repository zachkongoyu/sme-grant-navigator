import { requireUser } from '@/lib/auth';

import { InvestorEmailClient } from './InvestorEmailClient';

export default async function InvestorEmailPage() {
  await requireUser('/fundraise/investor-email');

  return <InvestorEmailClient />;
}

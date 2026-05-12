import { requireUser } from '@/lib/auth';

import { PitchDeckClient } from './PitchDeckClient';

export default async function PitchDeckPage() {
  await requireUser('/fundraise/pitch-deck');

  return <PitchDeckClient />;
}

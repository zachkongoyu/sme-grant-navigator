import { requireUser } from '@/lib/auth';

import { DataRoomClient } from './DataRoomClient';

export default async function DataRoomPage() {
  await requireUser('/fundraise/data-room');

  return <DataRoomClient />;
}

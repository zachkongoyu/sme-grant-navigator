// Default drafter: redirect to the Easy BUD scheme
import { redirect } from 'next/navigation';

export default function DraftPage() {
  redirect('/draft/easy-bud');
}

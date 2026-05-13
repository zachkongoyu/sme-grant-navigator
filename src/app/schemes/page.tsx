import React from 'react';
import { listSchemes } from '@/lib/schemes';
import SchemesPageClient from './SchemesPageClient';

export default async function SchemesPage() {
  const schemes = await listSchemes();
  return <SchemesPageClient initialSchemes={schemes} />;
}

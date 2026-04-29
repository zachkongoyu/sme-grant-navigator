import type { MetadataRoute } from 'next';

import { getAllSchemes } from '@/lib/schemes/db';

const baseUrl = 'https://www.thunderhk.ai';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/draft`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/funds`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reimbursement`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const schemes = await getAllSchemes();
  const schemeRoutes: MetadataRoute.Sitemap = schemes.map((scheme) => ({
    url: `${baseUrl}/funds/${scheme.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: scheme.id === 'easy-bud' ? 0.9 : 0.6,
  }));

  return [...staticRoutes, ...schemeRoutes];
}
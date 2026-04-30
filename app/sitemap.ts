import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/tools-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ais-pre-ux363wemzkx62lhysnmjdz-842599029511.run.app'; // Using the shared URL provided

  const toolRoutes = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...toolRoutes,
  ];
}

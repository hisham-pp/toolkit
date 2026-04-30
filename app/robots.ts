import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://ais-pre-ux363wemzkx62lhysnmjdz-842599029511.run.app/sitemap.xml',
  };
}

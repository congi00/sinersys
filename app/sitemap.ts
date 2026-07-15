import { MetadataRoute } from "next";

const BASE_URL = 'https://www.sinersys.it';
const LOCALES = ['it', 'en', 'de', 'fr'] as const;

const PAGES = [
    { path: '',              changeFreq: 'weekly'  as const, priority: 1.0 },
    { path: '/apwec-energia-rinnovabile',        changeFreq: 'weekly' as const, priority: 0.9 },
    { path: '/six-phase-motor', changeFreq: 'weekly' as const, priority: 0.9 },
    { path: '/about-us',     changeFreq: 'weekly'  as const, priority: 0.8 },
    { path: '/codice-etico', changeFreq: 'weekly'  as const, priority: 0.5 },
    { path: '/privacy',      changeFreq: 'weekly'  as const, priority: 0.5 },
    { path: '/cookies',      changeFreq: 'weekly'  as const, priority: 0.5 },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified,
      changeFrequency: page.changeFreq,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map(l => [l, `${BASE_URL}/${l}${page.path}`])
        )
      }
    }))
  );
}
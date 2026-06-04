import { MetadataRoute } from "next";

const BASE_URL = 'https://sinersys.it';
const LOCALES = ['it', 'en', 'de', 'fr'] as const;

const PAGES = [
    { path: '',              changeFreq: 'weekly'  as const, priority: 1.0 },
    { path: '/apwec',        changeFreq: 'monthly' as const, priority: 0.9 },
    { path: '/six-phase-motor', changeFreq: 'monthly' as const, priority: 0.9 },
    { path: '/about-us',     changeFreq: 'yearly'  as const, priority: 0.8 },
    { path: '/codice-etico', changeFreq: 'yearly'  as const, priority: 0.5 },
    { path: '/privacy',      changeFreq: 'yearly'  as const, priority: 0.5 },
    { path: '/cookies',      changeFreq: 'yearly'  as const, priority: 0.5 },
  ];


export default function sitemap(): MetadataRoute.Sitemap {
    return LOCALES.flatMap((locale) =>
      PAGES.map((page) => ({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
      }))
    );
}
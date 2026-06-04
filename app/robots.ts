import { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
        { userAgent: '*', allow: '/' },
        { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/_next/'] },
    ],
    sitemap: "https://sinersys.it/sitemap.xml",
    host: 'https://sinersys.it',
  };
}
  
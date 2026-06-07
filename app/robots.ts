import { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
        { userAgent: '*', allow: '/' },
        { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/_next/'] },
    ],
    sitemap: "https://www.sinersys.it/sitemap.xml",
    host: 'https://www.sinersys.it',
  };
}
  
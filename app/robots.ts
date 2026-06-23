import { MetadataRoute } from "next";

  
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { 
        userAgent: '*', 
        allow: '/',
        disallow: ['/api/', '/_next/', '/server-sitemap.xml'],
      },
      { 
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    sitemap: 'https://www.sinersys.it/sitemap.xml',
    host: 'https://www.sinersys.it',
  };
}
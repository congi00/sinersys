import { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://sinersys.it", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://sinersys.it/about-us", lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    { url: "https://sinersys.it/apwec", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://sinersys.it/six-phase-motor", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://sinersys.it/codice-etico", lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    { url: "https://sinersys.it/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    { url: "https://sinersys.it/cookies", lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
  ];
}
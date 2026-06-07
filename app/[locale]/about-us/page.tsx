// app/[locale]/about-us/page.tsx
//
// Questo file sostituisce completamente il vecchio AboutUsPage che usava
// AboutUsContainer come prop. Ora AboutUsPage è autosufficiente.

import AboutUsPage from "@/app/containers/AboutUsPage";
import { buildBreadcrumb } from "@/app/utilities";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: 'aboutus' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'About',
    name: 'Sinersys — New Energy Frontiers',
    description: t('hero.suptitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://www.sinersys.it' },
    category: 'Renewable Energy Technology',
  };

  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about-us" },
  ]);
  
  return {
    title: t('hero.suptitle'),
    description: t('hero.subtitle'),
    keywords: t('keywords'),
    authors: [{ name: 'Sinersys' }],
    creator: 'Sinersys',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: `https://www.sinersys.it/${locale}/aboutus`,
      languages: { it: '/it/aboutus', en: '/en/aboutus', de: '/de/aboutus', fr: '/fr/aboutus' },
    },
    other: {
      "script:ld+json": [
        JSON.stringify(productSchema),
        JSON.stringify(breadcrumb),
      ]
    },
  };
}

export default function Page() {
  return <AboutUsPage />;
}
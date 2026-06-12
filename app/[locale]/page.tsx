import { Metadata } from "next";
import HomeClient from "../HomeClient"; // sposta tutto il codice attuale qui
import { getTranslations } from "next-intl/server";
import WorkInProgressPage from "../WorkInProgressPage";
import { buildBreadcrumb } from "../utilities";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: 'homepage' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'home',
    name: 'Home',
    description: t('slide0.subtitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://www.sinersys.it' },
    category: 'Renewable Energy Technology',
  };

  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
  ]);

  return {
    title: 'Sinersys - New Energy Frontiers',
    description: t('slide0.subtitle'),
    keywords: t('keywords'),
    authors: [{ name: 'Sinersys' }],
    creator: 'Sinersys',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: `https://www.sinersys.it/${locale}/`,
      languages: { it: '/it/', en: '/en/', de: '/de/', fr: '/fr/six-phase-motor' },
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
  
  return <WorkInProgressPage />
}
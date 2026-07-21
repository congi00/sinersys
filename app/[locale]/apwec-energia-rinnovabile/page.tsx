import { getTranslations } from "next-intl/server";
import ApwecPage from "../../containers/ApwecPage";
import { buildBreadcrumb } from "@/app/utilities";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: 'apwec' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter',
    description: t('slide0.subtitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://www.sinersys.it' },
    category: 'Renewable Energy Technology',
    keywords: 'generatore rinnovabile, energia rinnovabile, APWEC, nuove frontiere di energia',
    url: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
  };

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter in funzione',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M6S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w.mp4',
    embedUrl: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  const videoSchemaM = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter in funzione',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M5S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w1.mp4',
    embedUrl: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  const videoSchemaB = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter in funzione',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M5S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w2.mp4',
    embedUrl: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };


  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
    { name: "APWEC", path: "/apwec-energia-rinnovabile" },
  ]);
  
  return {
    title: t('slide0.title'),
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
      canonical: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
      languages: { 
        'it': 'https://www.sinersys.it/it/apwec-energia-rinnovabile',
        'en': 'https://www.sinersys.it/en/apwec-energia-rinnovabile',
        'de': 'https://www.sinersys.it/de/apwec-energia-rinnovabile',
        'fr': 'https://www.sinersys.it/fr/apwec-energia-rinnovabile',
        'x-default': 'https://www.sinersys.it/it/apwec-energia-rinnovabile', },
    },
    other: {
      "script:ld+json": [
        JSON.stringify(productSchema),
        JSON.stringify(breadcrumb),
        JSON.stringify(videoSchema),
        JSON.stringify(videoSchemaM),
        JSON.stringify(videoSchemaB),
      ]
    },
  };
}

export default async function Page({params} : Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: 'apwec' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter',
    description: t('slide0.subtitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://www.sinersys.it' },
    category: 'Renewable Energy Technology',
    keywords: 'generatore rinnovabile, energia rinnovabile, APWEC, nuove frontiere di energia',
    url: `https://www.sinersys.it/${locale}/apwec`,
  };

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter in funzione',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M6S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w.mp4',
    embedUrl: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  const videoSchemaM = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter in funzione',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M5S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w1.mp4',
    embedUrl: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  const videoSchemaB = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter in funzione',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M5S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecprod_fixed_w2.mp4',
    embedUrl: `https://www.sinersys.it/${locale}/apwec-energia-rinnovabile`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchemaM) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchemaB) }} />
    <ApwecPage />
  </>
}
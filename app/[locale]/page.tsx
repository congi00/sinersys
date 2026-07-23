import { Metadata } from "next";
import HomeClient from "../HomeClient"; // sposta tutto il codice attuale qui
import { getTranslations } from "next-intl/server";
import { buildBreadcrumb } from "../utilities";


type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: 'homepage' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Home',
    description: t('slide0.subtitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://www.sinersys.it' },
    category: 'Renewable Energy Technology',
  };

  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
  ]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Cos\' è Sinersys?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sinersys nasce all\'interno di Motor Union Italia, un laboratorio di ricerca e sviluppo focalizzata su tecnologie innovative per l\'energia rinnovabile, tra cui APWEC, e per l\'ottimizzazione energetica con il motore a 6 fasi.'
        }
      },
      {
        '@type': 'Question', 
        name: 'Cos\' è APWEC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'APWEC (Autonomous Perpetual Wave Energy Converter) è un sistema brevettato Sinersys, un generatore di energia rinnovabile \nche utilizza la depressione del fluido aria, producendo elettricità in maniera continua'
        }
      },
      {
        '@type': 'Question',
        name: 'Qual è la differenza tra APWEC e le pale eoliche?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A differenza delle pale eoliche, APWEC non dipende direttamente dall\'irraggiamento solare o dalle variabili metereologiche, e può operare praticamente ininterrottamente durante tutto l’anno. Risparmio energetico reale, inesistenza di emissioni, indipendenza dalla rete elettrica.'
        }
      }
    ]
  };

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter Presentation',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M15S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecintro.mp4',
    embedUrl: `https://www.sinersys.it/${locale}`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  const videoSchemaM = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter Presentation',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M15S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecintro1.mp4',
    embedUrl: `https://www.sinersys.it/${locale}`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  return {
    title: 'Sinersys | ' + t('slide0.title'),
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
      languages: { 
        'it': 'https://www.sinersys.it/it/',
        'en': 'https://www.sinersys.it/en/',
        'de': 'https://www.sinersys.it/de/',
        'fr': 'https://www.sinersys.it/fr/',
        'x-default': 'https://www.sinersys.it/it/', 
      },
    },
    other: {
      "script:ld+json": [
        JSON.stringify(productSchema),
        JSON.stringify(breadcrumb),
        JSON.stringify(faqSchema),
        JSON.stringify(videoSchema),
        JSON.stringify(videoSchemaM)
      ]
    },
  };
}

export default async function Page({ params }: Props) {  
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'homepage' });

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Home',
    description: t('slide0.subtitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://www.sinersys.it' },
    category: 'Renewable Energy Technology',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Cos\' è Sinersys?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sinersys nasce all\'interno di Motor Union Italia, un laboratorio di ricerca e sviluppo focalizzata su tecnologie innovative per l\'energia rinnovabile, tra cui APWEC, e per l\'ottimizzazione energetica con il motore a 6 fasi.'
        }
      },
      {
        '@type': 'Question', 
        name: 'Cos\' è APWEC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'APWEC (Autonomous Perpetual Wave Energy Converter) è un sistema brevettato Sinersys, un generatore di energia rinnovabile \nche utilizza la depressione del fluido aria, producendo elettricità in maniera continua'
        }
      },
      {
        '@type': 'Question',
        name: 'Qual è la differenza tra APWEC e le pale eoliche?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A differenza delle pale eoliche, APWEC non dipende direttamente dall\'irraggiamento solare o dalle variabili metereologiche, e può operare praticamente ininterrottamente durante tutto l’anno. Risparmio energetico reale, inesistenza di emissioni, indipendenza dalla rete elettrica.'
        }
      }
    ]
  };

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter Presentation',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M15S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecintro.mp4',
    embedUrl: `https://www.sinersys.it/${locale}`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  const videoSchemaM = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter Presentation',
    description: t('slide0.subtitle'),
    thumbnailUrl: ['https://www.sinersys.it/full-logo-sinersys_blu.png'],
    uploadDate: '2026-07-06T00:00:00+01:00', // data reale di pubblicazione del girato
    duration: 'PT0M15S', // durata reale del file, formato ISO 8601
    contentUrl: 'https://www.sinersys.it/apwecintro1.mp4',
    embedUrl: `https://www.sinersys.it/${locale}`,
    publisher: { '@type': 'Organization', name: 'Sinersys', logo: { '@type': 'ImageObject', url: 'https://www.sinersys.it/full-logo-sinersys.png' } },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchemaM) }} />
    <HomeClient />
  </>
}
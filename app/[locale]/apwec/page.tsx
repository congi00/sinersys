import { getTranslations } from "next-intl/server";
import ApwecPage from "../../containers/ApwecPage";
import { buildBreadcrumb } from "@/app/utilities";

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
  };

  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
    { name: "APWEC", path: "/apwec" },
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
      canonical: `https://www.sinersys.it/${locale}/apwec`,
      languages: { it: '/it/apwec', en: '/en/apwec', de: '/de/apwec', fr: '/fr/apwec' },
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
  return <ApwecPage />;
}
import { getTranslations } from "next-intl/server";
import ApwecPage from "../../containers/ApwecPage";
import { buildBreadcrumb } from "@/app/utilities";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'apwec' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'APWEC — Autonomous Perpetual Wave Energy Converter',
    description: t('meta.description'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://sinersys.it' },
    category: 'Renewable Energy Technology',
  };

  const breadcrumb = buildBreadcrumb(params.locale, [
    { name: "Home", path: "/" },
    { name: "APWEC", path: "/apwec" },
  ]);
  
  return {
    title: t('slide0.title'),
    description: t('slide0.subtitle'),
    alternates: {
      canonical: `https://sinersys.it/${params.locale}/apwec`,
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

import { getTranslations } from "next-intl/server";
import SixPhasePage from "../../containers/SixPhasePage";
import { buildBreadcrumb } from "@/app/utilities";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'motore6fasi' });
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'SixPhaseMotor',
    name: 'Six Phase Motor',
    description: t('slide0.subtitle'),
    brand: { '@type': 'Brand', name: 'Sinersys' },
    manufacturer: { '@type': 'Organization', name: 'Sinersys', url: 'https://sinersys.it' },
    category: 'Renewable Energy Technology',
  };

  const breadcrumb = buildBreadcrumb(params.locale, [
    { name: "Home", path: "/" },
    { name: "Six Phase Motor", path: "/six-phase-motor" },
  ]);

  return {
    title: t('slide0.title'),
    description: t('slide0.subtitle'),
    alternates: {
      canonical: `https://sinersys.it/${params.locale}/six-phase-motor`,
      languages: { it: '/it/six-phase-motor', en: '/en/six-phase-motor', de: '/de/six-phase-motor', fr: '/fr/six-phase-motor' },
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
  return <SixPhasePage />;
}
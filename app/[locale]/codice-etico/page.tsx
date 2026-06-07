import { getTranslations } from "next-intl/server";
import EthicsPage from "../../containers/EthicsPage";

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale, namespace: 'ethics' });
    return {
      title: t('title'),   // es. 'APWEC — Autonomous Perpetual Wave Energy Converter'
      description: t('subtitle'),
      alternates: {
        canonical: `https://www.sinersys.it/${locale}/ethics`,
        languages: { it: '/it/ethics', en: '/en/ethics', de: '/de/ethics', fr: '/fr/ethics' },
      },
    };
  }
  
export default function Page() { return <EthicsPage />; }